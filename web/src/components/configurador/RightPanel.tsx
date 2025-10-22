import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { StationTab } from './tabs/StationTab';
import { POAsTab } from './tabs/POAsTab';
import { PanelTab } from './tabs/PanelTab';
import { SummaryTab } from './tabs/SummaryTab';

interface RightPanelProps {
  station: any;
  onUpdate: () => void;
}

export const RightPanel = ({ station, onUpdate }: RightPanelProps) => {
  const [activeTab, setActiveTab] = useState('station');

  if (!station) {
    return (
      <div className="w-96 border-l bg-background p-6">
        <p className="text-muted-foreground text-center">Selecciona una estación</p>
      </div>
    );
  }

  return (
    <div className="w-96 border-l bg-background flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="border-b px-4 pt-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="station">Estación</TabsTrigger>
            <TabsTrigger value="poas">POAs</TabsTrigger>
            <TabsTrigger value="panel">Cuadro</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="station">
            <StationTab station={station} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="poas">
            <POAsTab station={station} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="panel">
            <PanelTab station={station} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="summary">
            <SummaryTab station={station} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

