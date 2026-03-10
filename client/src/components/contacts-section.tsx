import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@shared/schema";
import { CONTACT_TYPES } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users, X, Check, Mail } from "lucide-react";

interface ContactFormData {
  name: string;
  contactType: string;
  email: string;
  title: string;
  notes: string;
}

const emptyForm: ContactFormData = {
  name: "",
  contactType: "Other",
  email: "",
  title: "",
  notes: "",
};

function ContactForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  initial: ContactFormData;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<ContactFormData>(initial);

  return (
    <div className="space-y-2 border rounded-md p-2 bg-muted/30">
      <Input
        placeholder="Name *"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="h-8 text-xs"
      />
      <Select
        value={form.contactType}
        onValueChange={(v) => setForm({ ...form, contactType: v })}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONTACT_TYPES.map((t) => (
            <SelectItem key={t} value={t} className="text-xs">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="h-8 text-xs"
      />
      <Input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="h-8 text-xs"
      />
      <Textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="text-xs resize-none"
        rows={2}
      />
      <div className="flex gap-1.5">
        <Button
          size="sm"
          className="h-7 text-xs flex-1"
          disabled={isPending || !form.name.trim()}
          onClick={() => onSubmit(form)}
        >
          <Check className="w-3 h-3 mr-1" />
          {submitLabel}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={onCancel}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function ContactItem({
  contact,
  prospectId,
}: {
  contact: Contact;
  prospectId: number;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      await apiRequest("PATCH", `/api/contacts/${contact.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/prospects/${prospectId}/contacts`],
      });
      toast({ title: "Contact updated" });
      setEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update contact", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/contacts/${contact.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/prospects/${prospectId}/contacts`],
      });
      toast({ title: "Contact deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete contact", variant: "destructive" });
    },
  });

  if (editing) {
    return (
      <ContactForm
        initial={{
          name: contact.name,
          contactType: contact.contactType,
          email: contact.email ?? "",
          title: contact.title ?? "",
          notes: contact.notes ?? "",
        }}
        onSubmit={(data) => updateMutation.mutate(data)}
        onCancel={() => setEditing(false)}
        isPending={updateMutation.isPending}
        submitLabel="Save"
      />
    );
  }

  const typeColor =
    contact.contactType === "Recruiter"
      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
      : contact.contactType === "Current Employee"
        ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950"
        : "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800";

  return (
    <div className="border rounded-md p-2 space-y-1 bg-card text-xs group/contact">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{contact.name}</p>
          {contact.title && (
            <p className="text-muted-foreground truncate">{contact.title}</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/contact:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-2.5 h-2.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColor}`}
        >
          {contact.contactType}
        </span>
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-2.5 h-2.5" />
            {contact.email}
          </a>
        )}
      </div>
      {contact.notes && (
        <p className="text-muted-foreground line-clamp-2">{contact.notes}</p>
      )}
    </div>
  );
}

export function ContactsSection({ prospectId }: { prospectId: number }) {
  const [adding, setAdding] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: [`/api/prospects/${prospectId}/contacts`],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      await apiRequest("POST", `/api/prospects/${prospectId}/contacts`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/prospects/${prospectId}/contacts`],
      });
      toast({ title: "Contact added" });
      setAdding(false);
    },
    onError: () => {
      toast({ title: "Failed to add contact", variant: "destructive" });
    },
  });

  const filtered =
    typeFilter === "all"
      ? contacts
      : contacts.filter((c) => c.contactType === typeFilter);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">
            Contacts ({contacts.length})
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs px-2"
          onClick={() => setAdding(true)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {contacts.length > 0 && (
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Types
            </SelectItem>
            {CONTACT_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-xs">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {adding && (
        <ContactForm
          initial={emptyForm}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setAdding(false)}
          isPending={createMutation.isPending}
          submitLabel="Add Contact"
        />
      )}

      <div className="space-y-1.5">
        {filtered.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            prospectId={prospectId}
          />
        ))}
      </div>
    </div>
  );
}
