import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { SpaceAddress, SpaceContact } from '@/types/space';
import { z } from 'zod';

interface CreateSpaceDialogProps {
  onCreateSpace: (
    name: string,
    description: string,
    address?: SpaceAddress,
    contact?: SpaceContact
  ) => void;
}

const emailSchema = z.string().email({ message: 'Please enter a valid email address' });
const phoneSchema = z.string().min(1, { message: 'Phone number is required' }).max(20, { message: 'Phone number must be less than 20 characters' });

export function CreateSpaceDialog({ onCreateSpace }: CreateSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Address fields
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  
  // Contact fields
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setPostalCode('');
    setCountry('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setEmailError('');
    setPhoneError('');
    setNameError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (!name.trim() || name.trim().length < 3) {
      setNameError('Space name must be at least 3 characters');
      return;
    }
    setNameError('');

    // Validate email (required)
    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      setEmailError(emailResult.error.errors[0]?.message || 'Please enter a valid email address');
      return;
    }
    setEmailError('');

    // Validate phone (required)
    const phoneResult = phoneSchema.safeParse(phone.trim());
    if (!phoneResult.success) {
      setPhoneError(phoneResult.error.errors[0]?.message || 'Phone number is required');
      return;
    }
    setPhoneError('');

    const address: SpaceAddress | undefined = 
      addressLine1 || addressLine2 || city || postalCode || country
        ? {
            line1: addressLine1.trim() || undefined,
            line2: addressLine2.trim() || undefined,
            city: city.trim() || undefined,
            postalCode: postalCode.trim() || undefined,
            country: country.trim() || undefined,
          }
        : undefined;

    const contact: SpaceContact = {
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim(),
    };

    onCreateSpace(name.trim(), description.trim(), address, contact);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create New Space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Space</DialogTitle>
            <DialogDescription>
              Create a space for your property's instructions and guides.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Beach House, Mountain Cabin"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                maxLength={100}
                required
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your property..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>

            {/* Mandatory Contact Fields */}
            <div className="space-y-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Contact Details</h4>
              <p className="text-sm text-muted-foreground">
                This information will be displayed on the Contact Us page.
              </p>
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Contact Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  maxLength={255}
                  required
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-phone">Contact Phone *</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError('');
                  }}
                  maxLength={20}
                  required
                />
                {phoneError && (
                  <p className="text-sm text-destructive">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Collapsible Optional Fields */}
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => setShowOptional(!showOptional)}
            >
              <span>Optional: Address & WhatsApp</span>
              {showOptional ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {showOptional && (
              <div className="space-y-4 border-t border-border pt-4">
                {/* Address Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Property Address</h4>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Address line 1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Address line 2 (optional)"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      maxLength={100}
                    />
                    <Input
                      placeholder="Postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* WhatsApp Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">WhatsApp (Optional)</h4>
                  <div className="grid gap-2">
                    <Input
                      type="tel"
                      placeholder="WhatsApp number"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Create Space
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
