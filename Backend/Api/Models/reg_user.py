from sqlmodel import SQLModel,Field
from pydantic import EmailStr
class user(SQLModel,table=True):
    __tablename__ = "users"
    id:int|None = Field(default=None,primary_key=True)
    name:str = Field(default=None,max_length=50)
    email:EmailStr = Field(default=None,max_length=50)
    
    hashed_password:str 