import { Button } from '@/components/ui/Button';
import { Plus, ChevronLeft, ChevronRight, Gauge, Wand2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SidebarProps {
  stations: any[];
  currentStation: any;
  onSelectStation: (id: string) => void;
  onCreateStation: () => void;
  onOpenWizard?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({
  stations,
  currentStation,
  onSelectStation,
  onCreateStation,
  onOpenWizard,
  isOpen,
  onToggle,
}: SidebarProps) => {
  return (
    <>
      <div
        className={cn(
          'bg-background border-r transition-all duration-300',
          isOpen ? 'w-64' : 'w-0'
        )}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b space-y-2">
              {onOpenWizard && (
                <Button 
                  onClick={onOpenWizard} 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  🪄 Asistente (Wizard)
                </Button>
              )}
              <Button onClick={onCreateStation} size="sm" className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Estación
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-2">
              <div className="space-y-1">
                {stations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => onSelectStation(station.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      currentStation?.id === station.id && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{station.name}</p>
                        {station.provincia && (
                          <p className="text-xs text-muted-foreground">{station.provincia}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className="h-full w-6 border-r bg-background hover:bg-accent transition-colors flex items-center justify-center"
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </>
  );
};

