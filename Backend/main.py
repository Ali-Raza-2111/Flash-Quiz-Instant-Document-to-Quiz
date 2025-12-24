from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from database import engine
from Api.Router.user_router import router as user_router
from Api.Router.authenticater import router as auth_router
from Api.Router.protected_router import router as protected_routes
from Api.Router.quiz_router import router as quiz_router
from scalar_fastapi import get_scalar_api_reference

@asynccontextmanager
async def life_span_handler(app:FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    try:
        yield
    finally:
        await engine.dispose()

app = FastAPI(lifespan=life_span_handler)
app.include_router(user_router,tags=["users"])
app.include_router(auth_router,tags=["token"])
app.include_router(protected_routes,tags=["protected"])
app.include_router(quiz_router,tags=["quiz"])
app.mount(
    "/scalar", 
    get_scalar_api_reference(openapi_url=app.openapi_url)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
