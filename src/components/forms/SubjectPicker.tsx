import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Subject } from '@/hooks/useSubjects';

interface SubjectPickerProps {
  label: string;
  availableSubjects: Subject[];
  selectedSubjects: string[];
  onChange: (subjects: string[]) => void;
  variant?: 'outline' | 'secondary';
}

export function SubjectPicker({ label, availableSubjects, selectedSubjects, onChange, variant = 'outline' }: SubjectPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = availableSubjects.filter(
    s => s.name.toLowerCase().includes(search.toLowerCase()) && !selectedSubjects.includes(s.name)
  );

  const addSubject = (name: string) => {
    onChange([...selectedSubjects, name]);
    setSearch('');
  };

  const removeSubject = (name: string) => {
    onChange(selectedSubjects.filter(s => s !== name));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {/* Selected subjects */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {selectedSubjects.map(name => (
          <Badge key={name} variant={variant} className="text-xs gap-1 py-1">
            {name}
            <button type="button" onClick={() => removeSubject(name)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      {/* Search input */}
      <div className="relative">
        <Input
          placeholder="Search and add subjects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && filtered.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
            {filtered.map(s => (
              <button
                key={s.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => addSubject(s.name)}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        {search && filtered.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md p-3">
            <p className="text-sm text-muted-foreground">No matching subjects. Add it from the Subjects page first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
