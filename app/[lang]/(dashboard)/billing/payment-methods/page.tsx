'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentMethodsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 800); // placeholder
  };

  return (
    <div className="max-w-3xl mx-auto pt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Payment methods
          </CardTitle>
          <CardDescription>
            Securely add a debit/credit card for bookings and deposits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Card number</Label>
              <Input placeholder="4242 4242 4242 4242" required />
            </div>
            <div>
              <Label>Expiry</Label>
              <Input placeholder="MM/YY" required />
            </div>
            <div>
              <Label>CVC</Label>
              <Input placeholder="123" required />
            </div>
            <div className="sm:col-span-2">
              <Label>Name on card</Label>
              <Input placeholder="John Doe" required />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save method'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved cards</CardTitle>
          <CardDescription>You can add multiple cards and set a default later.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">No cards yet.</CardContent>
      </Card>
    </div>
  );
}

