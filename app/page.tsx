import { BlockDAGSimulation } from "@/components/blockdag-simulation"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Interactive BlockDAG Simulation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explore how BlockDAG technology enables parallel transaction processing and faster confirmation times for
            high-throughput DeFi applications.
          </p>
        </div>
        <BlockDAGSimulation />
      </div>
    </main>
  )
}
