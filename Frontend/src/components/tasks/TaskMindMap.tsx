"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  Handle,
  Position,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import type { EchoTask } from "@/types/task";
import { cn } from "@/lib/utils";

const TaskFlowNode = memo(function TaskFlowNode({
  data,
}: NodeProps<{ label: string; priority?: string }>) {
  return (
    <div
      className={cn(
        "px-3 py-2 rounded-xl border border-white/10 bg-neutral-900/95 shadow-xl backdrop-blur-sm",
        "max-w-[240px] text-xs text-neutral-200 cursor-grab active:cursor-grabbing"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !bg-indigo-500 !border-0"
      />
      <p className="leading-snug font-medium">{data.label}</p>
      {data.priority && (
        <span className="text-[9px] uppercase tracking-wide text-neutral-500 mt-1.5 block">
          {data.priority}
        </span>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !bg-indigo-500 !border-0"
      />
    </div>
  );
});

const nodeTypes: NodeTypes = { task: TaskFlowNode };

function layoutFallback(index: number) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return { x: 48 + col * 200, y: 48 + row * 140 };
}

export default function TaskMindMap({
  tasks,
  onUpdate,
}: {
  tasks: EchoTask[];
  onUpdate: () => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);

  const activeTasks = useMemo(
    () =>
      tasks.filter(
        (t) => t.status !== "completed" && (t.board_column || "") !== "done"
      ),
    [tasks]
  );

  useEffect(() => {
    setNodes(
      activeTasks.map((t, i) => ({
        id: String(t.id),
        type: "task",
        position: {
          x: t.position_x ?? layoutFallback(i).x,
          y: t.position_y ?? layoutFallback(i).y,
        },
        data: { label: t.task, priority: t.priority },
      }))
    );
  }, [activeTasks, setNodes]);

  const onNodeDragStop = useCallback(
    async (_: unknown, node: Node) => {
      try {
        await apiClient.updateTask(Number(node.id), {
          position_x: node.position.x,
          position_y: node.position.y,
        });
        onUpdate();
      } catch (e) {
        console.error(e);
      }
    },
    [onUpdate]
  );

  return (
    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-neutral-100">
          Zero-gravity task map
        </CardTitle>
        <p className="text-sm text-neutral-500 font-normal">
          Drag nodes anywhere on the canvas. Positions persist for each task.
          Showing {activeTasks.length} active tasks (completed hidden).
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[min(65vh,640px)] w-full border-t border-neutral-800 bg-neutral-950 [&_.react-flow\_\_attribution]:hidden">
          {activeTasks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
              No active tasks to display on the map.
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={[]}
              onNodesChange={onNodesChange}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.4}
              maxZoom={1.5}
              className="bg-neutral-950"
            >
              <Background gap={20} color="#27272a" />
              <Controls className="!bg-neutral-900 !border-neutral-800 [&_button]:!fill-neutral-300" />
              <MiniMap
                className="!bg-neutral-900 !border-neutral-800"
                nodeColor={() => "#6366f1"}
              />
            </ReactFlow>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
