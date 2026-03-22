import { Activity, Dna } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <Dna className="text-emerald-500"/>
      <Activity />
      {/* 2. Use o botão */}
      <Button className="bg-emerald-500 text-white hover:bg-emerald-600">Botão Padrão</Button>

      {/* 3. Use as variantes! */}
      <Button variant="secondary">Secundário</Button>
      <Button variant="destructive">Destrutivo</Button>
      <Button variant="outline">Contorno</Button>
      <Button variant="ghost">Fantasma</Button>
      <Button variant="link">Link</Button>

      {/* 4. Mude o tamanho */}
      <Button size="lg">Botão Grande</Button>
      <Button size="sm">Botão Pequeno</Button>
      <Button size="icon">?</Button>

    </main>
  );
}
