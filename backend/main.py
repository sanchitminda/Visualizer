"""
Real-time Text Relation Map Visualizer - Backend
This FastAPI application processes text input using spaCy NLP to extract entities
and relationships, then broadcasts the data to connected clients via WebSocket.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import spacy
import json
from typing import List, Dict, Set
import asyncio

app = FastAPI(title="Text Relation Map API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model 'en_core_web_sm'...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Store connected clients
clients: List[WebSocket] = []

# Store global graph state to maintain consistency
graph_state = {
    "nodes": {},  # {id: {data: {id, label, type}}}
    "edges": {}   # {id: {data: {id, source, target, label}}}
}


def extract_entities_and_relations(text: str) -> Dict:
    """
    Extract entities (nodes) and relationships (edges) from text using spaCy.
    Returns a dictionary with nodes and edges compatible with Cytoscape.js.
    """
    doc = nlp(text)
    
    nodes = {}
    edges = {}
    edge_counter = len(graph_state["edges"])
    
    # Extract named entities as nodes
    for ent in doc.ents:
        node_id = f"node_{ent.text.replace(' ', '_')}"
        if node_id not in graph_state["nodes"]:
            nodes[node_id] = {
                "data": {
                    "id": node_id,
                    "label": ent.text,
                    "type": ent.label_
                }
            }
    
    # Extract key noun chunks as potential entities if no named entities found
    if not nodes:
        for chunk in doc.noun_chunks:
            # Skip pronouns and very short chunks
            if chunk.root.pos_ not in ["PRON"] and len(chunk.text) > 2:
                node_id = f"node_{chunk.text.replace(' ', '_')}"
                if node_id not in graph_state["nodes"]:
                    nodes[node_id] = {
                        "data": {
                            "id": node_id,
                            "label": chunk.text,
                            "type": "CONCEPT"
                        }
                    }
    
    # Extract relationships using dependency parsing
    for token in doc:
        # Look for verbs that connect entities
        if token.pos_ == "VERB":
            # Find subject
            subjects = [child for child in token.children if child.dep_ in ["nsubj", "nsubjpass"]]
            # Find objects
            objects = [child for child in token.children if child.dep_ in ["dobj", "pobj", "obj"]]
            
            for subj in subjects:
                for obj in objects:
                    # Get the root of noun chunks
                    subj_text = subj.text
                    obj_text = obj.text
                    
                    # Try to match with entities
                    subj_id = f"node_{subj_text.replace(' ', '_')}"
                    obj_id = f"node_{obj_text.replace(' ', '_')}"
                    
                    # Check if these nodes exist or should be created
                    for node_id, node in nodes.items():
                        if subj_text.lower() in node["data"]["label"].lower():
                            subj_id = node_id
                        if obj_text.lower() in node["data"]["label"].lower():
                            obj_id = node_id
                    
                    # Create nodes if they don't exist
                    if subj_id not in graph_state["nodes"] and subj_id not in nodes:
                        nodes[subj_id] = {
                            "data": {
                                "id": subj_id,
                                "label": subj_text,
                                "type": "ENTITY"
                            }
                        }
                    
                    if obj_id not in graph_state["nodes"] and obj_id not in nodes:
                        nodes[obj_id] = {
                            "data": {
                                "id": obj_id,
                                "label": obj_text,
                                "type": "ENTITY"
                            }
                        }
                    
                    # Create edge
                    edge_id = f"edge_{edge_counter}"
                    edge_counter += 1
                    edges[edge_id] = {
                        "data": {
                            "id": edge_id,
                            "source": subj_id,
                            "target": obj_id,
                            "label": token.text
                        }
                    }
    
    # Update global state
    graph_state["nodes"].update(nodes)
    graph_state["edges"].update(edges)
    
    return {
        "nodes": list(nodes.values()),
        "edges": list(edges.values())
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication with clients."""
    await websocket.accept()
    clients.append(websocket)
    
    # Send current graph state to the new client
    await websocket.send_json({
        "type": "initial",
        "data": {
            "nodes": list(graph_state["nodes"].values()),
            "edges": list(graph_state["edges"].values())
        }
    })
    
    try:
        while True:
            # Receive text from client
            data = await websocket.receive_json()
            
            if data.get("type") == "text":
                text = data.get("text", "")
                
                if text.strip():
                    # Process text and extract entities and relations
                    graph_data = extract_entities_and_relations(text)
                    
                    # Broadcast to all connected clients
                    disconnected = []
                    for client in clients:
                        try:
                            await client.send_json({
                                "type": "update",
                                "data": graph_data
                            })
                        except Exception:
                            disconnected.append(client)
                    
                    # Remove disconnected clients
                    for client in disconnected:
                        clients.remove(client)
            
            elif data.get("type") == "clear":
                # Clear the graph state
                graph_state["nodes"].clear()
                graph_state["edges"].clear()
                
                # Broadcast clear command to all clients
                disconnected = []
                for client in clients:
                    try:
                        await client.send_json({
                            "type": "clear"
                        })
                    except Exception:
                        disconnected.append(client)
                
                for client in disconnected:
                    clients.remove(client)
                    
    except WebSocketDisconnect:
        clients.remove(websocket)
        print(f"Client disconnected. Active clients: {len(clients)}")


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "Text Relation Map API is running",
        "websocket_endpoint": "/ws"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "active_clients": len(clients),
        "graph_nodes": len(graph_state["nodes"]),
        "graph_edges": len(graph_state["edges"])
    }
