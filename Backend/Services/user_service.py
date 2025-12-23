from sqlalchemy.ext.asyncio import AsyncSession
from Api.Schemas.user_schemas import CreateUser,ReturnedUser
from Services.auth_service import AuthService
from Api.Models.reg_user import user


async def create_user(request:CreateUser,db:AsyncSession) ->ReturnedUser:
    hasehd_password = AuthService.hash_password(request.password)
    new_user = user(
        name=request.name,
        email = request.email,
        hashed_password=hasehd_password,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user