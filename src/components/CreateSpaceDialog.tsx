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
const phoneSchema = z.string().max(20).optional();

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
    setShowOptional(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email (required)
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setEmailError(result.error.errors[0]?.message || 'Please enter a valid email address');
      return;
    }
    setEmailError('');

    if (name.trim()) {
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

      const contact: SpaceContact | undefined = 
        phone || whatsapp || email
          ? {
              phone: phone.trim() || undefined,
              whatsapp: whatsapp.trim() || undefined,
              email: email.trim() || undefined,
            }
          : undefined;

      onCreateSpace(name.trim(), description.trim(), address, contact);
      resetForm();
      setOpen(false);
    }
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
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
              />
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

            {/* Collapsible Optional Fields */}
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => setShowOptional(!showOptional)}
            >
              <span>Optional: Address & Contact Details</span>
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

                {/* Contact Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Contact Details</h4>
                  <div className="grid gap-2">
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      type="tel"
                      placeholder="WhatsApp number"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      maxLength={20}
                    />
                  </div>
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
