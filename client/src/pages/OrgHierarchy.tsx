import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { OrgTree } from '../components/OrgTree';
import { Network, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

export const OrgHierarchy: React.FC = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/organization/tree');
      if (res.data.success) {
        setTreeData(res.data.tree);
        toast.success('Org tree refreshed successfully');
      }
    } catch (err: any) {
      console.error('Error fetching org tree:', err);
      toast.error(err.response?.data?.message || 'Failed to load organizational tree.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} />
        Dashboard
      </button>

      {/* Title Header Card */}
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 shadow-sm border border-border bg-card">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg border border-primary/20">
              <Network size={18} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight font-display text-foreground">
              Reporting Tree Hierarchy
            </h1>
          </div>
          <p className="text-muted-foreground text-xs mt-1 font-medium">
            Visual tree displaying active reporting lines. Click on any profile icon link to view detail card.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchTreeData}
          className="flex items-center gap-1.5"
        >
          <Loader2 className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} size={14} />
          <span>Refresh Chart</span>
        </Button>
      </Card>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Card className="p-24 flex flex-col items-center justify-center gap-3 border border-border shadow-sm bg-card">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-muted-foreground text-sm font-medium">Constructing organizational nodes...</p>
        </Card>
      ) : (
        <OrgTree tree={treeData} />
      )}
    </div>
  );
};
