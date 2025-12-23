# Api/Routes/protected_routes.py
from fastapi import APIRouter, Depends
from Api.Security.Oath2 import get_current_user
from Api.Models.reg_user import user as User

router = APIRouter(
    
)

@router.get("/login")
async def dashboard(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Welcome to your dashboard, {current_user.email}!",
        "user_info": current_user.email,
    }


