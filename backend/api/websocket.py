# backend/api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect

clients: list[WebSocket] = []

async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        clients.remove(ws)

async def broadcast(data: dict):
    dead = []
    for c in clients:
        try:
            await c.send_json(data)
        except Exception:
            dead.append(c)
    for d in dead:
        clients.remove(d)