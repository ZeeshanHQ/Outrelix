from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>Test Server</title>
        </head>
        <body>
            <h1>Test Server is Running!</h1>
            <p>If you can see this, the server is working correctly.</p>
        </body>
    </html>
    """

if __name__ == "__main__":
    try:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=3000
        )
    except Exception as e:
        print(f"Error starting server: {str(e)}") 