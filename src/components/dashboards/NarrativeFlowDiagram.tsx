'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { select, scaleLinear, scaleOrdinal, schemeCategory10, max, min, interpolateZoom, zoom, zoomIdentity } from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react';

interface NarrativeNode {
  id: string;
  name: string;
  stage: string;
  interactions: number;
  dropoff: number;
  completion: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  type: 'progress' | 'dropoff' | 'completion';
}

interface SankeyNode {
  id: string;
  name: string;
  stage: string;
  interactions: number;
  dropoff: number;
  completion: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

export function NarrativeFlowDiagram({ data }: { data: NarrativeNode[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SankeyNode | null>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr('width', width).attr('height', height);

    // Create main group for zooming
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Process data for Sankey diagram
    const nodes: SankeyNode[] = data.map(node => ({ ...node }));
    const links: SankeyLink[] = [];

    // Generate links between consecutive stages
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];
      
      // Progress link (users who continue)
      const progressValue = Math.round(currentNode.interactions * (1 - currentNode.dropoff / 100));
      links.push({
        source: currentNode.id,
        target: nextNode.id,
        value: progressValue,
        type: 'progress'
      });

      // Dropoff link (users who abandon)
      const dropoffValue = Math.round(currentNode.interactions * (currentNode.dropoff / 100));
      links.push({
        source: currentNode.id,
        target: `dropoff_${currentNode.id}`,
        value: dropoffValue,
        type: 'dropoff'
      });
    }

    // Add dropoff nodes
    nodes.forEach(node => {
      if (node.dropoff > 0) {
        nodes.push({
          id: `dropoff_${node.id}`,
          name: 'Abandono',
          stage: 'dropoff',
          interactions: Math.round(node.interactions * (node.dropoff / 100)),
          dropoff: 0,
          completion: 0
        });
      }
    });

    // Simple Sankey layout implementation
    const nodeWidth = 15;
    const nodePadding = 10;
    const stageWidth = (width - margin.left - margin.right) / 4; // Assuming 4 stages max

    // Position nodes by stage
    const stages = ['awareness', 'interest', 'desire', 'action'];
    nodes.forEach((node, i) => {
      const stageIndex = stages.indexOf(node.stage) !== -1 ? stages.indexOf(node.stage) : 3;
      node.x0 = margin.left + stageIndex * stageWidth;
      node.x1 = node.x0 + nodeWidth;
      
      // Simple vertical positioning
      const nodesInStage = nodes.filter(n => n.stage === node.stage);
      const nodeIndex = nodesInStage.indexOf(node);
      const totalHeight = nodesInStage.length * (nodeWidth + nodePadding);
      const startY = (height - totalHeight) / 2;
      
      node.y0 = startY + nodeIndex * (nodeWidth + nodePadding);
      node.y1 = node.y0 + nodeWidth;
    });

    // Draw links
    const linkGroup = mainGroup.append('g').attr('class', 'links');
    
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode) return;

      const linkPath = linkGroup.append('path')
        .attr('class', `link ${link.type}`)
        .attr('d', generateLinkPath(sourceNode, targetNode))
        .style('fill', 'none')
        .style('stroke', getLinkColor(link.type))
        .style('stroke-opacity', 0.6)
        .style('stroke-width', Math.max(1, link.value / 10))
        .on('mouseover', function() {
          d3.select(this).style('stroke-opacity', 0.9);
        })
        .on('mouseout', function() {
          d3.select(this).style('stroke-opacity', 0.6);
        });

      // Add gradient for better visualization
      const gradientId = `gradient-${link.source}-${link.target}`;
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', getLinkColor(link.type))
        .attr('stop-opacity', 0.8);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', getLinkColor(link.type))
        .attr('stop-opacity', 0.3);

      linkPath.style('stroke', `url(#${gradientId})`);
    });

    // Draw nodes
    const nodeGroup = mainGroup.append('g').attr('class', 'nodes');
    
    nodes.forEach(node => {
      const nodeElement = nodeGroup.append('rect')
        .attr('class', `node ${node.stage}`)
        .attr('x', node.x0!)
        .attr('y', node.y0!)
        .attr('width', node.x1! - node.x0!)
        .attr('height', node.y1! - node.y0!)
        .style('fill', getNodeColor(node.stage))
        .style('stroke', '#fff')
        .style('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedNode(node))
        .on('mouseover', function() {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function() {
          d3.select(this).style('opacity', 1);
        });

      // Add node labels
      nodeGroup.append('text')
        .attr('x', (node.x0! + node.x1!) / 2)
        .attr('y', node.y0! - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(node.name);

      // Add interaction count
      if (node.interactions > 0) {
        nodeGroup.append('text')
          .attr('x', (node.x0! + node.x1!) / 2)
          .attr('y', (node.y0! + node.y1!) / 2)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('font-size', '10px')
          .style('fill', '#fff')
          .style('font-weight', 'bold')
          .text(node.interactions.toLocaleString());
      }
    });

    // Apply zoom
    mainGroup.attr('transform', `scale(${zoom})`);

  }, [data, zoom]);

  const generateLinkPath = (source: SankeyNode, target: SankeyNode): string => {
    const x0 = source.x1!;
    const x1 = target.x0!;
    const y0 = (source.y0! + source.y1!) / 2;
    const y1 = (target.y0! + target.y1!) / 2;
    
    const curvature = 0.5;
    const xi = d3.interpolateNumber(x0, x1);
    const x2 = xi(curvature);
    const x3 = xi(1 - curvature);
    
    return `M${x0},${y0}C${x2},${y0} ${x3},${y1} ${x1},${y1}`;
  };

  const getLinkColor = (type: string): string => {
    switch (type) {
      case 'progress': return '#10b981'; // green
      case 'dropoff': return '#ef4444'; // red
      case 'completion': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  const getNodeColor = (stage: string): string => {
    switch (stage) {
      case 'awareness': return '#3b82f6';
      case 'interest': return '#10b981';
      case 'desire': return '#f59e0b';
      case 'action': return '#ef4444';
      case 'dropoff': return '#6b7280';
      default: return '#8b5cf6';
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleReset = () => setZoom(1);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    // Animation logic would go here
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Diagrama de Flujo Narrativo</CardTitle>
            <CardDescription>
              Visualización interactiva del recorrido narrativo con diagrama de Sankey
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAnimation}
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            ref={svgRef}
            className="w-full h-full border rounded-lg"
            style={{ minHeight: '400px' }}
          />
          
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
              <h4 className="font-semibold text-sm mb-2">{selectedNode.name}</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Etapa:</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedNode.stage}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Interacciones:</span>
                  <span className="font-medium">{selectedNode.interactions.toLocaleString()}</span>
                </div>
                {selectedNode.dropoff > 0 && (
                  <div className="flex justify-between">
                    <span>Abandono:</span>
                    <span className="font-medium text-red-600">{selectedNode.dropoff}%</span>
                  </div>
                )}
                {selectedNode.completion > 0 && (
                  <div className="flex justify-between">
                    <span>Completitud:</span>
                    <span className="font-medium text-green-600">{selectedNode.completion}%</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setSelectedNode(null)}
              >
                Cerrar
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded"></div>
            <span>Progreso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500 rounded"></div>
            <span>Abandono</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span>Completitud</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}