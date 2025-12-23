from fastapi import APIRouter,Depends
from Api.Schemas.user_schemas import CreateUser,ReturnedUser
from Services import user_service as UserService
from sqlalchemy.ext.asyncio import AsyncSession
from Api.Schemas.user_schemas import UserBase
from database import get_session

router = APIRouter()


@router.post('/user',response_model=ReturnedUser)
async def create_user(request:CreateUser,session:AsyncSession = Depends(get_session))->ReturnedUser:
    return await UserService.create_user(request,session)


