import { useRef, useState } from 'react';

export function KanbanColumn({ column, count, canDrop, onDropTicket, children }) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  function handleDragEnter() {
    if (!canDrop) return;
    depth.current += 1;
    setOver(true);
  }

  function handleDragLeave() {
    if (!canDrop) return;
    depth.current -= 1;
    if (depth.current <= 0) {
      depth.current = 0;
      setOver(false);
    }
  }

  function handleDragOver(e) {
    if (!canDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    if (!canDrop) return;
    e.preventDefault();
    depth.current = 0;
    setOver(false);
    onDropTicket(column.value);
  }

  return (
    <section
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-[280px] h-full min-h-0 flex flex-col rounded-lg p-3 border-2 transition-colors ${
        over && canDrop ? 'border-accent bg-accent/5' : 'border-transparent bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="text-[13px] font-semibold text-ink-muted uppercase tracking-wide">{column.label}</div>
        <div className="bg-gray-200 text-ink-muted text-xs font-semibold px-2 py-0.5 rounded-full">{count}</div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-0.5">{children}</div>
    </section>
  );
}
