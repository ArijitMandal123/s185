from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio

app = FastAPI()

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_teams: Dict[str, str] = {}  # user_id -> team_id

    async def connect(self, websocket: WebSocket, team_id: str, user_id: str):
        await websocket.accept()
        if team_id not in self.active_connections:
            self.active_connections[team_id] = []
        self.active_connections[team_id].append(websocket)
        self.user_teams[user_id] = team_id

    def disconnect(self, websocket: WebSocket, user_id: str):
        team_id = self.user_teams.get(user_id)
        if team_id and team_id in self.active_connections:
            self.active_connections[team_id].remove(websocket)
            if not self.active_connections[team_id]:
                del self.active_connections[team_id]
        if user_id in self.user_teams:
            del self.user_teams[user_id]

    async def broadcast(self, team_id: str, message: dict):
        if team_id in self.active_connections:
            for connection in self.active_connections[team_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{team_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, team_id: str, user_id: str):
    await manager.connect(websocket, team_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            message["sender_id"] = user_id
            await manager.broadcast(team_id, message)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        await manager.broadcast(team_id, {
            "type": "user_left",
            "user_id": user_id
        }) 