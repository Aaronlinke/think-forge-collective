import { GitBranch, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type Branch = {
  id: string;
  branch_name: string;
  parent_message_id: string;
};

type BranchSelectorProps = {
  branches: Branch[];
  currentBranchId: string | null;
  onSwitchBranch: (branchId: string | null) => void;
  onDeleteBranch: (branchId: string) => void;
  onRenameBranch: (branchId: string, newName: string) => void;
};

export const BranchSelector = ({
  branches,
  currentBranchId,
  onSwitchBranch,
  onDeleteBranch,
  onRenameBranch,
}: BranchSelectorProps) => {
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState("");

  const handleRename = (branchId: string) => {
    if (newBranchName.trim()) {
      onRenameBranch(branchId, newBranchName);
      setEditingBranchId(null);
      setNewBranchName("");
    }
  };

  if (branches.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <GitBranch className="w-4 h-4 text-muted-foreground" />
      <Select value={currentBranchId || "main"} onValueChange={(value) => onSwitchBranch(value === "main" ? null : value)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="main">
            <div className="flex items-center gap-2">
              <span>Haupt-Thread</span>
              {!currentBranchId && <Badge variant="secondary">Aktiv</Badge>}
            </div>
          </SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              <div className="flex items-center justify-between gap-2 w-full">
                <span>{branch.branch_name}</span>
                {currentBranchId === branch.id && <Badge variant="secondary">Aktiv</Badge>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentBranchId && (
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const branch = branches.find((b) => b.id === currentBranchId);
                  setNewBranchName(branch?.branch_name || "");
                  setEditingBranchId(currentBranchId);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Branch umbenennen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="branch-name">Neuer Name</Label>
                  <Input
                    id="branch-name"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="Branch Name"
                  />
                </div>
                <Button
                  onClick={() => editingBranchId && handleRename(editingBranchId)}
                  className="w-full"
                >
                  Umbenennen
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Branch wirklich löschen?")) {
                onDeleteBranch(currentBranchId);
              }
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
};
