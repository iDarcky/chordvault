import { Input } from '../ui/Input';
import { SegmentedControl } from '../ui/SegmentedControl';

/**
 * Setlist metadata form — name, date, service type.
 */
export default function SetlistMetaForm({ name, date, service, onNameChange, onDateChange, onServiceChange }) {
  return (
    <div className="flex gap-2.5 flex-wrap px-5 py-4">
      <div className="flex-1 min-w-[200px] flex flex-col gap-1">
        <label className="section-title px-0.5">Setlist Name</label>
        <Input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Sunday Morning Service"
        />
      </div>
      <div className="w-[150px] flex flex-col gap-1">
        <label className="section-title px-0.5">Date</label>
        <Input
          type="date"
          value={date}
          onChange={e => onDateChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="section-title px-0.5">Service</label>
        <SegmentedControl
          value={service}
          onChange={onServiceChange}
          options={[
            { value: 'Morning', label: 'Morning' },
            { value: 'Evening', label: 'Evening' },
            { value: 'Special', label: 'Special' },
          ]}
          size="xs"
        />
      </div>
    </div>
  );
}
