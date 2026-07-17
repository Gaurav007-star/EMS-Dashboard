import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  User,
  Network,
  Mail,
  Phone,
  Briefcase,
  Building2,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TreeNodeData {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: string;
  status: string;
  profileImage: string;
  children: TreeNodeData[];
}

interface OrgTreeProps {
  tree: TreeNodeData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type BadgeVariant = 'destructive' | 'default' | 'secondary';

function getRoleBadgeVariant(role: string): BadgeVariant {
  if (role === 'Super Admin') return 'destructive';
  if (role === 'HR Manager') return 'default';
  return 'secondary';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Avatar with image fallback */
const Avatar: React.FC<{ src: string; name: string; size?: 'sm' | 'lg' }> = ({
  src,
  name,
  size = 'sm',
}) => {
  const dim  = size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const icon = size === 'lg' ? 22 : 16;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover shrink-0 border-2 border-border`}
      />
    );
  }

  return (
    <div className={`${dim} rounded-full bg-muted border-2 border-border flex items-center justify-center text-muted-foreground shrink-0`}>
      <User size={icon} />
    </div>
  );
};

/** Single icon + text row used in the hover popup */
const DetailRow: React.FC<{ icon: React.ElementType; value: string; mono?: boolean }> = ({
  icon: Icon,
  value,
  mono = false,
}) => (
  <div className="flex items-center gap-2 text-xs">
    <Icon size={12} className="text-muted-foreground shrink-0" />
    <span className={`text-foreground truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

// ─── Employee Card ─────────────────────────────────────────────────────────────

const EmployeeCard: React.FC<{
  node: TreeNodeData;
  isRoot?: boolean;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
}> = ({ node, isRoot = false, hasChildren, expanded, onToggle }) => {
  const navigate = useNavigate();
  const badgeVariant = getRoleBadgeVariant(node.role);

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>
        <div
          className={`
            relative flex flex-col items-center gap-1 p-3 rounded-xl border
            transition-all duration-150 cursor-pointer select-none w-[160px]
            hover:shadow-lg hover:border-primary/40 hover:bg-muted/40
            ${isRoot
              ? 'bg-primary/8 border-primary/30 shadow-sm'
              : 'bg-card border-border'
            }
          `}
          onClick={() => navigate(`/employees/${node._id}`)}
        >
          {/* Avatar */}
          <Avatar src={node.profileImage} name={node.name} size="sm" />

          {/* Name + designation */}
          <div className="text-center min-w-0 w-full px-1">
            <p className="text-[12px] font-bold text-foreground leading-tight truncate">{node.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">{node.designation}</p>
          </div>

          {/* Role badge */}
          <Badge variant={badgeVariant} className="text-[9px] px-1.5 py-0">
            {node.role}
          </Badge>

          {/* Expand / collapse toggle */}
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10
                w-6 h-6 rounded-full bg-card border border-border shadow-sm
                flex items-center justify-center hover:bg-muted transition-colors"
            >
              {expanded
                ? <ChevronDown  size={12} className="text-muted-foreground" />
                : <ChevronRight size={12} className="text-muted-foreground" />
              }
            </button>
          )}
        </div>
      </HoverCardTrigger>

      {/* ── Hover detail popup ── */}
      <HoverCardContent side="right" align="start" className="w-72">
        <div className="space-y-3">

          <div className="flex items-center gap-3">
            <Avatar src={node.profileImage} name={node.name} size="lg" />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-foreground truncate">{node.name}</h4>
              <p className="text-xs text-primary font-semibold truncate">{node.designation}</p>
              <Badge variant={badgeVariant} className="mt-1 text-[10px]">{node.role}</Badge>
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="space-y-2">
            <DetailRow icon={Mail}      value={node.email}      />
            <DetailRow icon={Phone}     value={node.phone}      />
            <DetailRow icon={Building2} value={node.department} />
            <DetailRow icon={Briefcase} value={node.employeeId} mono />
          </div>

          <button
            onClick={() => navigate(`/employees/${node._id}`)}
            className="w-full text-center text-xs font-semibold text-primary hover:underline pt-1 border-t border-border"
          >
            View Full Profile
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

// ─── Recursive Node ───────────────────────────────────────────────────────────

const OrgNode: React.FC<{ node: TreeNodeData; isRoot?: boolean }> = ({
  node,
  isRoot = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">

      {/* Card */}
      <EmployeeCard
        node={node}
        isRoot={isRoot}
        hasChildren={hasChildren}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />

      {/* Children row */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center mt-3">

          {/* Vertical line from card to horizontal bar */}
          <div className="w-[1.5px] h-6 bg-border/70" />

          {node.children.length === 1 ? (
            /* Single child — just a straight vertical line */
            <OrgNode node={node.children[0]} />
          ) : (
            /* Multiple children — horizontal bar + branches */
            <div className="flex flex-col items-center w-full">

              {/* Horizontal connector bar */}
              <div className="relative flex items-start justify-center w-full">
                <div
                  className="h-[1.5px] bg-border/70"
                  style={{ width: `calc(100% - 160px)` }}
                />
              </div>

              {/* Children in a row */}
              <div className="flex items-start gap-8">
                {node.children.map((child) => (
                  <div key={child._id} className="flex flex-col items-center">
                    {/* Vertical drop from bar to child card */}
                    <div className="w-[1.5px] h-5 bg-border/70" />
                    <OrgNode node={child} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── OrgTree (root export) ────────────────────────────────────────────────────

export const OrgTree: React.FC<OrgTreeProps> = ({ tree }) => {
  if (!tree || tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border shadow-sm">
        <Network className="text-muted-foreground mb-3" size={40} />
        <p className="text-muted-foreground font-medium text-sm">No hierarchical relationships found.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Assign reporting managers to employees to generate the tree.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
      <div className="min-w-fit flex flex-col items-center gap-10">
        {tree.map((root) => (
          <OrgNode key={root._id} node={root} isRoot />
        ))}
      </div>
    </div>
  );
};
