
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, Pencil, Crop } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

const Account = () => {
  const { isAuthenticated, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [occupation, setOccupation] = useState('');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImage, setTempImage] = useState('');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    if (user) {
      setName(user.name || '');
      setNickname(user.nickname || '');
      setEmail(user.email || '');
      setGender(user.gender || '');
      setBio(user.bio || '');
      setProfileImage(user.profileImage || '');
      setOccupation(user.occupation || '');
    }
  }, [isAuthenticated, navigate, user]);
  
  const handleSaveChanges = () => {
    updateProfile({
      name,
      nickname,
      email,
      gender,
      bio,
      profileImage,
      occupation
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTempImage(reader.result);
        setShowImageEditor(true);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleImageUpload = () => {
    // For now, we're just using the temp image directly
    // In a real implementation, you would apply cropping here
    setProfileImage(tempImage);
    setShowImageEditor(false);
    
    // Auto-save when profile image is changed
    updateProfile({
      name,
      nickname,
      email,
      gender,
      bio,
      profileImage: tempImage,
      occupation
    });
    
    toast({
      title: "Profile image updated",
      description: "Your profile image has been updated successfully.",
    });
  };
  
  const cancelImageEdit = () => {
    setShowImageEditor(false);
    setTempImage('');
  };
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  const getInitials = () => {
    if (!nickname && !name) return 'U';
    const text = nickname || name;
    return text
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="app-page">
      <h1 className="text-3xl font-bold mb-8">Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4 group cursor-pointer" onClick={openFilePicker}>
              <Avatar className="h-32 w-32">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={name} />
                ) : (
                  <AvatarFallback className="text-2xl bg-brand-purple text-white">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Pencil className="h-6 w-6 text-white" />
              </div>
              <input 
                ref={fileInputRef}
                id="profileImage" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageSelect}
              />
              <label 
                htmlFor="profileImage" 
                className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer"
                title="Upload profile image"
              >
                <UploadCloud className="h-5 w-5" />
              </label>
            </div>
            <div className="text-center">
              {name && <p className="font-medium text-lg mb-1">{name}</p>}
              {nickname && <p className="text-sm text-muted-foreground">@{nickname}</p>}
              {occupation && (
                <p className="text-sm text-muted-foreground mt-3">
                  <em className="italic">{occupation}</em>
                </p>
              )}
              {bio && <p className="text-base mt-5 text-muted-foreground">{bio}</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name"
                  className="cursor-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input 
                  id="nickname" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)} 
                  placeholder="Your nickname"
                  className="cursor-text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input 
                  id="occupation" 
                  value={occupation} 
                  onChange={(e) => setOccupation(e.target.value)} 
                  placeholder="Your occupation"
                  className="cursor-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your.email@example.com"
                  className="cursor-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short bio about yourself"
                  className="min-h-[100px] cursor-text"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSaveChanges}
                  className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showImageEditor} onOpenChange={setShowImageEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>
              Adjust your profile picture. You can crop and resize it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {tempImage && (
              <div className="relative">
                <img 
                  src={tempImage} 
                  alt="Profile Preview" 
                  className="max-w-full max-h-[300px] object-contain rounded-md"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 rounded-md p-1">
                  <Crop className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button 
                variant="outline" 
                onClick={cancelImageEdit}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleImageUpload}
              className="cursor-pointer"
            >
              Save Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;
