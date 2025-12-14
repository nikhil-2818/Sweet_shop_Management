from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session
import shutil
from pathlib import Path
import uuid

from ..database import get_db
from ..models import User, Sweet
from ..schemas import (
    SweetCreate,
    SweetUpdate,
    SweetResponse,
    PurchaseRequest,
    RestockRequest
)
from ..utils.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api/sweets", tags=["Sweets"])

@router.post("/upload-image", response_model=dict)
async def upload_sweet_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an image for a sweet (requires authentication)"""
    # Validate file type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/sweets")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Return URL path
    return {"image_url": f"/uploads/sweets/{unique_filename}"}

@router.post("", response_model=SweetResponse, status_code=status.HTTP_201_CREATED)
def create_sweet(
    sweet_data: SweetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new sweet (requires authentication)"""
    new_sweet = Sweet(**sweet_data.model_dump())
    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)
    return new_sweet

@router.get("", response_model=List[SweetResponse])
def get_all_sweets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sweets (requires authentication)"""
    sweets = db.query(Sweet).all()
    return sweets

@router.get("/search", response_model=List[SweetResponse])
def search_sweets(
    name: Optional[str] = Query(None, description="Search by name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search sweets with filters (requires authentication)"""
    query = db.query(Sweet)
    
    if name:
        query = query.filter(Sweet.name.ilike(f"%{name}%"))
    
    if category:
        query = query.filter(Sweet.category.ilike(f"%{category}%"))
    
    if min_price is not None:
        query = query.filter(Sweet.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Sweet.price <= max_price)
    
    sweets = query.all()
    return sweets

@router.get("/{sweet_id}", response_model=SweetResponse)
def get_sweet(
    sweet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific sweet by ID (requires authentication)"""
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    return sweet

@router.put("/{sweet_id}", response_model=SweetResponse)
def update_sweet(
    sweet_id: int,
    sweet_data: SweetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a sweet (requires authentication)"""
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    
    # Update only provided fields
    update_data = sweet_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sweet, field, value)
    
    db.commit()
    db.refresh(sweet)
    return sweet

@router.delete("/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet(
    sweet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a sweet (admin only)"""
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    
    db.delete(sweet)
    db.commit()
    return None

@router.post("/{sweet_id}/purchase", response_model=SweetResponse)
def purchase_sweet(
    sweet_id: int,
    purchase_data: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Purchase a sweet (decreases quantity)"""
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    
    if sweet.quantity < purchase_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock. Available: {sweet.quantity}"
        )
    
    sweet.quantity -= purchase_data.quantity
    db.commit()
    db.refresh(sweet)
    return sweet

@router.post("/{sweet_id}/restock", response_model=SweetResponse)
def restock_sweet(
    sweet_id: int,
    restock_data: RestockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Restock a sweet (admin only, increases quantity)"""
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    
    sweet.quantity += restock_data.quantity
    db.commit()
    db.refresh(sweet)
    return sweet