import * as React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function UITest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Prueba de Componentes UI</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Botones:</h2>
        <div className="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Badges:</h2>
        <div className="flex gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="secondary">Secondary</Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Cards:</h2>
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Card de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Este es el contenido de la card de prueba.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}