import {  useState  } from "react";
import {  Search  } from "lucide-react";
import {  Input  } from "@/components/ui/input";
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from "@/components/ui/tabs";
import {  CandidatesList  } from "@/components/candidates/CandidatesList";
import {  CandidatesKanban  } from "@/components/candidates/CandidatesKanban";
const Candidates = () => {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [viewMode, setViewMode] = useState('list');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <p className="text-muted-foreground">Manage and track all your candidates</p>
      </div>
      {/* View Tabs */}
      <Tabs 
        defaultValue="list" 
        className="space-y-6"
        onValueChange={(value) => setViewMode(value)}
      >
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <CandidatesList 
            search={search} 
            stage={stage} 
            onStageChange={setStage} 
            viewMode={viewMode}
          />
        </TabsContent>
        <TabsContent value="kanban" className="space-y-4">
          <CandidatesKanban search={search} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Candidates;