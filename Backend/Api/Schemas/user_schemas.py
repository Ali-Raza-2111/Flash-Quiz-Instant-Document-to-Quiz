from pydantic import BaseModel


class UserBase(BaseModel):
    name:str
    email: str
class CreateUser(UserBase):
    password:str
    
class UserInDb(UserBase):
    hashed_password: str
   
    
class ReturnedUser(UserBase):
    pass
    