"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

const RotateCcwIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
)

const ZapIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const HashIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
)

const Link2Icon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const CheckCircle2Icon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
)

interface Block {
  id: string
  number: number
  transaction: string
  parents: string[]
  children: string[]
  confirmationScore: number
  status: "pending" | "confirmed" | "final"
  timestamp: number
}

interface BlockPosition {
  x: number
  y: number
  level: number
}

class BlockDAGCore {
  private blocks: Map<string, Block> = new Map()
  private blockCounter = 1

  constructor() {
    const genesisBlock: Block = {
      id: "genesis",
      number: 0,
      transaction: "Genesis Block",
      parents: [],
      children: [],
      confirmationScore: Number.POSITIVE_INFINITY,
      status: "final",
      timestamp: Date.now(),
    }
    this.blocks.set("genesis", genesisBlock)
  }

  getAllBlocks(): Block[] {
    return Array.from(this.blocks.values()).sort((a, b) => a.number - b.number)
  }

  getBlock(id: string): Block | undefined {
    return this.blocks.get(id)
  }

  getLeafNodes(): Block[] {
    return this.getAllBlocks().filter((block) => block.children.length === 0)
  }

  addTransaction(transaction: string): Block[] {
    if (!transaction.trim()) return this.getAllBlocks()

    const leafNodes = this.getLeafNodes()

    const newBlock: Block = {
      id: `block-${this.blockCounter}`,
      number: this.blockCounter,
      transaction: transaction.trim(),
      parents: leafNodes.map((node) => node.id),
      children: [],
      confirmationScore: 0,
      status: "pending",
      timestamp: Date.now(),
    }

    leafNodes.forEach((parentBlock) => {
      const updatedParent = { ...parentBlock, children: [...parentBlock.children, newBlock.id] }
      this.blocks.set(parentBlock.id, updatedParent)
    })

    this.blocks.set(newBlock.id, newBlock)
    this.blockCounter++

    this.updateAllConfirmationScores()

    return this.getAllBlocks()
  }

  private calculateConfirmationScore(blockId: string): number {
    const block = this.blocks.get(blockId)
    if (!block || block.id === "genesis") return block?.confirmationScore || 0

    return this.countDescendants(blockId)
  }

  private countDescendants(blockId: string): number {
    const block = this.blocks.get(blockId)
    if (!block || block.children.length === 0) return 0

    let count = block.children.length
    block.children.forEach((childId) => {
      count += this.countDescendants(childId)
    })

    return count
  }

  private updateAllConfirmationScores(): void {
    this.blocks.forEach((block, blockId) => {
      if (blockId === "genesis") return

      const confirmationScore = this.calculateConfirmationScore(blockId)

      let status: "pending" | "confirmed" | "final" = "pending"
      if (confirmationScore >= 3) status = "final"
      else if (confirmationScore >= 1) status = "confirmed"

      const updatedBlock = { ...block, confirmationScore, status }
      this.blocks.set(blockId, updatedBlock)
    })
  }

  getChildBlocks(blockId: string): Block[] {
    return this.getAllBlocks().filter((block) => block.parents.includes(blockId))
  }

  getParentBlocks(blockId: string): Block[] {
    const block = this.blocks.get(blockId)
    if (!block) return []

    return block.parents.map((parentId) => this.blocks.get(parentId)).filter(Boolean) as Block[]
  }

  validateDAGStructure(): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (blockId: string): boolean => {
      if (recursionStack.has(blockId)) return true
      if (visited.has(blockId)) return false

      visited.add(blockId)
      recursionStack.add(blockId)

      const block = this.blocks.get(blockId)
      if (block) {
        for (const childId of block.children) {
          if (hasCycle(childId)) return true
        }
      }

      recursionStack.delete(blockId)
      return false
    }

    for (const blockId of this.blocks.keys()) {
      if (!visited.has(blockId)) {
        if (hasCycle(blockId)) return false
      }
    }

    return true
  }

  calculateBlockLevels(): Map<string, number> {
    const levels = new Map<string, number>()
    const visited = new Set<string>()

    const calculateLevel = (blockId: string): number => {
      if (levels.has(blockId)) return levels.get(blockId)!
      if (visited.has(blockId)) return 0

      visited.add(blockId)
      const block = this.blocks.get(blockId)
      if (!block) return 0

      if (block.id === "genesis") {
        levels.set(blockId, 0)
        return 0
      }

      let maxParentLevel = -1
      for (const parentId of block.parents) {
        const parentLevel = calculateLevel(parentId)
        maxParentLevel = Math.max(maxParentLevel, parentLevel)
      }

      const level = maxParentLevel + 1
      levels.set(blockId, level)
      return level
    }

    this.getAllBlocks().forEach((block) => calculateLevel(block.id))
    return levels
  }
}

const BlockDAGSimulationComponent = () => {
  const [blockDAG] = useState(() => new BlockDAGCore())
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [transactionInput, setTransactionInput] = useState("")
  const [autoMode, setAutoMode] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1000)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const simulationRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setBlocks(blockDAG.getAllBlocks())
  }, [blockDAG])

  const calculateBlockPositions = (): Map<string, BlockPosition> => {
    const positions = new Map<string, BlockPosition>()
    const levels = blockDAG.calculateBlockLevels()
    const levelCounts = new Map<number, number>()

    // Count blocks per level
    levels.forEach((level) => {
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1)
    })

    const levelCounters = new Map<number, number>()

    blocks.forEach((block) => {
      const level = levels.get(block.id) || 0
      const currentCount = levelCounters.get(level) || 0
      const totalAtLevel = levelCounts.get(level) || 1

      const x = level * 200 + 100
      const y = (currentCount - (totalAtLevel - 1) / 2) * 120 + 200

      positions.set(block.id, { x, y, level })
      levelCounters.set(level, currentCount + 1)
    })

    return positions
  }

  const getStatusColor = (status: Block["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200/50"
      case "confirmed":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200/50"
      case "final":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/50"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200/50"
    }
  }

  const prepareGraphData = () => {
    const levels = blockDAG.calculateBlockLevels()

    const nodes: any[] = blocks.map((block) => {
      const isSelected = selectedBlock?.id === block.id

      let backgroundColor: string
      let borderColor: string
      const fontColor = "#ffffff"

      switch (block.status) {
        case "pending":
          backgroundColor = "linear-gradient(135deg, #f59e0b, #f97316)"
          borderColor = "#f59e0b"
          break
        case "confirmed":
          backgroundColor = "linear-gradient(135deg, #3b82f6, #6366f1)"
          borderColor = "#3b82f6"
          break
        case "final":
          backgroundColor = "linear-gradient(135deg, #10b981, #14b8a6)"
          borderColor = "#10b981"
          break
        default:
          backgroundColor = "linear-gradient(135deg, #6b7280, #9ca3af)"
          borderColor = "#6b7280"
      }

      if (block.id === "genesis") {
        backgroundColor = "linear-gradient(135deg, #10b981, #14b8a6)"
        borderColor = "#10b981"
      }

      return {
        id: block.id,
        label: `${block.id === "genesis" ? "Genesis" : `Block ${block.number}`}\n${block.transaction.length > 20 ? block.transaction.substring(0, 20) + "..." : block.transaction}\n${block.status.toUpperCase()}`,
        color: {
          background: backgroundColor,
          border: isSelected ? "#10b981" : borderColor,
          highlight: {
            background: backgroundColor,
            border: "#10b981",
          },
        },
        font: {
          color: fontColor,
          size: 12,
          face: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
        },
        shape: "box",
        size: 25,
        level: levels.get(block.id) || 0,
        borderWidth: isSelected ? 3 : 2,
        borderWidthSelected: 3,
        shadow: {
          enabled: true,
          color: "rgba(0,0,0,0.1)",
          size: 8,
          x: 0,
          y: 4,
        },
      }
    })

    const edges: any[] = []
    blocks.forEach((block) => {
      block.children.forEach((childId) => {
        edges.push({
          from: block.id,
          to: childId,
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.8,
            },
          },
          color: {
            color: "#6b7280",
            opacity: 0.7,
          },
          width: 2,
        })
      })
    })

    return { nodes, edges }
  }

  const transactionTemplates = {
    Trading: [
      "Swap 0.5 ETH for 1,200 BDAG",
      "Limit order: Buy 100 LINK @ $15",
      "Market sell 2,000 USDC for ETH",
      "Arbitrage: DEX A → DEX B",
    ],
    Lending: [
      "Lend 500 DAI at 5% APY",
      "Borrow 200 USDT against ETH",
      "Repay loan: 150 USDC + interest",
      "Liquidate undercollateralized position",
    ],
    Staking: [
      "Stake 1,000 BDAG tokens",
      "Delegate to validator node #42",
      "Unstake 500 tokens (7-day unlock)",
      "Claim staking rewards: 25 BDAG",
    ],
    Liquidity: [
      "Provide liquidity: ETH/USDC",
      "Remove liquidity from BDAG/DAI pool",
      "Yield farm on DEX protocol",
      "Impermanent loss protection claim",
    ],
    Advanced: [
      "Flash loan 10,000 USDC",
      "Cross-chain bridge ETH→BSC",
      "NFT marketplace trade",
      "Governance vote: Proposal #42",
      "Multi-sig wallet execution",
      "Options contract settlement",
    ],
  }

  const allTransactions = Object.values(transactionTemplates).flat()

  useEffect(() => {
    if (autoMode && !isLoading) {
      simulationRef.current = setInterval(() => {
        const randomTransaction = allTransactions[Math.floor(Math.random() * allTransactions.length)]
        addTransaction(randomTransaction)
      }, simulationSpeed * 2)
    } else if (simulationRef.current) {
      clearInterval(simulationRef.current)
      simulationRef.current = null
    }

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
      }
    }
  }, [autoMode, simulationSpeed, isLoading])

  const addTransaction = async () => {
    if (!transactionInput.trim()) return

    setIsLoading(true)
    try {
      const updatedBlocks = blockDAG.addTransaction(transactionInput)
      setBlocks(updatedBlocks)
      setTransactionInput("")

      if (selectedBlock) {
        const updatedSelectedBlock = blockDAG.getBlock(selectedBlock.id)
        setSelectedBlock(updatedSelectedBlock || null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const simulateHighVolume = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    const numTransactions = Math.floor(Math.random() * 4) + 4

    for (let i = 0; i < numTransactions; i++) {
      setTimeout(() => {
        const randomTransaction = allTransactions[Math.floor(Math.random() * allTransactions.length)]
        blockDAG.addTransaction(randomTransaction)
        setBlocks(blockDAG.getAllBlocks())

        if (i === numTransactions - 1) {
          setIsLoading(false)
        }
      }, i * simulationSpeed)
    }
  }, [isLoading, simulationSpeed, allTransactions, blockDAG])

  const resetSimulation = () => {
    setAutoMode(false)
    setIsLoading(false)
    setSelectedBlock(null)
    setTransactionInput("")

    const newDAG = new BlockDAGCore()
    setBlocks(newDAG.getAllBlocks())

    Object.setPrototypeOf(blockDAG, newDAG)
    Object.assign(blockDAG, newDAG)
  }

  const insertTemplate = (template: string) => {
    setTransactionInput(template)
  }

  const addBulkTransactions = (category: string) => {
    const templates = transactionTemplates[category as keyof typeof transactionTemplates]
    if (!templates) return

    setIsLoading(true)
    templates.forEach((template, index) => {
      setTimeout(
        () => {
          blockDAG.addTransaction(template)
          setBlocks(blockDAG.getAllBlocks())
          if (index === templates.length - 1) {
            setIsLoading(false)
          }
        },
        index * (simulationSpeed / 2),
      )
    })
  }

  const getStatusLabel = (status: Block["status"]) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "final":
        return "Final"
      default:
        return "Unknown"
    }
  }

  const getConfirmationMessage = (block: Block) => {
    if (block.id === "genesis") return "Genesis block - inherently final"

    const score = block.confirmationScore
    if (score === 0) return "Awaiting first confirmation"
    if (score === 1) return "Confirmed by 1 block"
    if (score < 3) return `Confirmed by ${score} blocks`
    return `Highly confirmed by ${score} blocks`
  }

  const getConfirmationProgress = (block: Block) => {
    if (block.id === "genesis") return 100
    return Math.min((block.confirmationScore / 3) * 100, 100)
  }

  const getBlockAge = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`
    return `${seconds}s ago`
  }

  const renderBlockInspector = () => {
    if (!selectedBlock) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <InfoIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Block Selected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
            Click on any block in the visualization to inspect its details and understand how BlockDAG confirmation
            works.
          </p>
        </div>
      )
    }

    const parentBlocks = blockDAG.getParentBlocks(selectedBlock.id)
    const childBlocks = blockDAG.getChildBlocks(selectedBlock.id)
    const confirmationProgress = getConfirmationProgress(selectedBlock)

    return (
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="relationships"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 transition-all duration-200"
            >
              Relations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                    <HashIcon />
                  </div>
                  {selectedBlock.id === "genesis" ? "Genesis Block" : `Block #${selectedBlock.number}`}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-2 ml-11">
                  <ClockIcon />
                  {getBlockAge(selectedBlock.timestamp)}
                </p>
              </div>
              <Badge className={`${getStatusColor(selectedBlock.status)} border-0 px-4 py-2 rounded-full font-medium`}>
                <CheckCircle2Icon />
                {getStatusLabel(selectedBlock.status)}
              </Badge>
            </div>

            <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <TrendingUpIcon />
                </div>
                DeFi Transaction
              </p>
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                  {selectedBlock.transaction}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <ShieldIcon />
                  </div>
                  Confirmation Status
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {selectedBlock.confirmationScore === Number.POSITIVE_INFINITY ? "∞" : selectedBlock.confirmationScore}{" "}
                  confirmations
                </span>
              </div>

              {selectedBlock.id !== "genesis" && (
                <div className="space-y-3">
                  <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <Progress value={confirmationProgress} className="h-3 bg-gray-200/50 dark:bg-gray-700/50" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {getConfirmationMessage(selectedBlock)}
                    </p>
                  </div>
                </div>
              )}

              {selectedBlock.id === "genesis" && (
                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50 p-4 rounded-xl shadow-lg">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                    Genesis block is the foundation of the BlockDAG and is inherently final.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">Block ID</div>
                <div className="font-mono text-sm text-blue-800 dark:text-blue-200 break-all">{selectedBlock.id}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">Timestamp</div>
                <div className="font-mono text-sm text-purple-800 dark:text-purple-200">
                  {new Date(selectedBlock.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                    <Link2Icon />
                  </div>
                  Parent Blocks ({parentBlocks.length})
                </p>
                {parentBlocks.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                  >
                    Confirms {parentBlocks.length} block{parentBlocks.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {parentBlocks.length > 0 ? (
                <div className="space-y-3">
                  {parentBlocks.map((parent) => (
                    <div
                      key={parent.id}
                      className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      onClick={() => setSelectedBlock(parent)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-lg">
                          <HashIcon />
                        </div>
                        <span className="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
                          {parent.id === "genesis" ? "Genesis" : `Block ${parent.number}`}
                        </span>
                      </div>
                      <Badge className={`${getStatusColor(parent.status)} border-0 text-xs px-3 py-1 rounded-full`}>
                        {getStatusLabel(parent.status)}
                      </Badge>
                    </div>
                  ))}
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      This block confirms all parent blocks, contributing to their security through the multi-parent DAG
                      structure.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-8">No parent blocks</p>
              )}
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <UsersIcon />
                  </div>
                  Child Blocks ({childBlocks.length})
                </p>
                {childBlocks.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                  >
                    Confirmed by {childBlocks.length} block{childBlocks.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {childBlocks.length > 0 ? (
                <div className="space-y-3">
                  {childBlocks.slice(0, 5).map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      onClick={() => setSelectedBlock(child)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-lg">
                          <HashIcon />
                        </div>
                        <span className="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
                          Block {child.number}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {getBlockAge(child.timestamp)}
                        </span>
                        <Badge className={`${getStatusColor(child.status)} border-0 text-xs px-3 py-1 rounded-full`}>
                          {getStatusLabel(child.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {childBlocks.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 font-medium">
                      ... and {childBlocks.length - 5} more child blocks
                    </p>
                  )}
                  <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 backdrop-blur-sm p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      These blocks reference this block as a parent, providing confirmation and increasing its security
                      score.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <UsersIcon />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">No child blocks yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    This block is currently a leaf node in the DAG
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/20 dark:to-purple-950/20 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/50 p-4 rounded-xl shadow-lg">
              <h5 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">BlockDAG Advantage</h5>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
                Unlike traditional blockchains, BlockDAG allows parallel processing of transactions, significantly
                improving throughput while maintaining security through multi-parent confirmation.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const toggleAutoMode = () => {
    setAutoMode(!autoMode)
  }

  const confirmedBlocks = blocks.filter((block) => block.status === "final").length
  const pendingBlocks = blocks.filter((block) => block.status === "pending").length

  const confirmationTimes = blocks
    .filter((block) => block.status === "final" && block.id !== "genesis")
    .map(
      (block) =>
        (block.timestamp -
          block.parents.reduce((acc, parentId) => {
            const parent = blockDAG.getBlock(parentId)
            return Math.min(acc, parent?.timestamp || Date.now())
          }, Date.now())) /
        1000,
    )

  const avgConfirmationTime =
    confirmationTimes.length > 0 ? confirmationTimes.reduce((acc, time) => acc + time, 0) / confirmationTimes.length : 0

  const throughput = blocks.length > 1 ? confirmedBlocks / avgConfirmationTime : 0

  const renderCustomVisualization = () => {
    const positions = calculateBlockPositions()
    const maxX = Math.max(...Array.from(positions.values()).map((p) => p.x)) + 200
    const maxY = Math.max(...Array.from(positions.values()).map((p) => p.y)) + 100
    const minY = Math.min(...Array.from(positions.values()).map((p) => p.y)) - 100

    return (
      <div className="w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-inner overflow-auto">
        <svg
          width={Math.max(maxX, 800)}
          height={Math.max(maxY - minY, 400)}
          className="w-full h-full"
          viewBox={`0 ${minY} ${Math.max(maxX, 800)} ${Math.max(maxY - minY, 400)}`}
        >
          {/* Render edges */}
          {blocks.map((block) =>
            block.children.map((childId) => {
              const fromPos = positions.get(block.id)
              const toPos = positions.get(childId)
              if (!fromPos || !toPos) return null

              return (
                <line
                  key={`${block.id}-${childId}`}
                  x1={fromPos.x + 60}
                  y1={fromPos.y}
                  x2={toPos.x - 60}
                  y2={toPos.y}
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeOpacity="0.7"
                  markerEnd="url(#arrowhead)"
                />
              )
            }),
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" fillOpacity="0.7" />
            </marker>
          </defs>

          {/* Render nodes */}
          {blocks.map((block) => {
            const pos = positions.get(block.id)
            if (!pos) return null

            const isSelected = selectedBlock?.id === block.id
            let bgColor: string
            let borderColor: string

            switch (block.status) {
              case "pending":
                bgColor = "#f59e0b"
                borderColor = "#f59e0b"
                break
              case "confirmed":
                bgColor = "#3b82f6"
                borderColor = "#3b82f6"
                break
              case "final":
                bgColor = "#10b981"
                borderColor = "#10b981"
                break
              default:
                bgColor = "#6b7280"
                borderColor = "#6b7280"
            }

            if (block.id === "genesis") {
              bgColor = "#10b981"
              borderColor = "#10b981"
            }

            return (
              <g key={block.id}>
                {/* Shadow */}
                <rect
                  x={pos.x - 58}
                  y={pos.y - 28}
                  width="120"
                  height="60"
                  rx="8"
                  fill="rgba(0,0,0,0.1)"
                  transform="translate(2, 2)"
                />

                {/* Block rectangle */}
                <rect
                  x={pos.x - 60}
                  y={pos.y - 30}
                  width="120"
                  height="60"
                  rx="8"
                  fill={bgColor}
                  stroke={isSelected ? "#10b981" : borderColor}
                  strokeWidth={isSelected ? "3" : "2"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedBlock(block)}
                />

                {/* Block text */}
                <text
                  x={pos.x}
                  y={pos.y - 10}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {block.id === "genesis" ? "Genesis" : `Block ${block.number}`}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  className="pointer-events-none select-none"
                >
                  {block.transaction.length > 15 ? block.transaction.substring(0, 15) + "..." : block.transaction}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 14}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {block.status.toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <InfoIcon />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            BlockDAG DeFi Simulator
          </h1>
          <p className="text-gray-600 font-medium">Interactive Parallel Transaction Processing</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-200/50 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">DeFi Transaction Data</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={transactionInput}
                onChange={(e) => setTransactionInput(e.target.value)}
                placeholder="Enter transaction details (e.g., 'Swap 100 USDC for ETH')"
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                onKeyPress={(e) => e.key === "Enter" && addTransaction()}
              />
              <button
                onClick={addTransaction}
                disabled={!transactionInput.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
              >
                <PlusIcon />
                Add
              </button>
            </div>
          </div>

          {/* Speed Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Simulation Speed</label>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
            >
              <option value={3000}>Slow (3s)</option>
              <option value={1500}>Normal (1.5s)</option>
              <option value={800}>Fast (0.8s)</option>
              <option value={400}>Very Fast (0.4s)</option>
            </select>
          </div>
        </div>

        {/* Transaction Templates */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Templates</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(transactionTemplates).map(([category, transactions]) => (
              <button
                key={category}
                onClick={() => addBulkTransactions(category)}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <PlusIcon />
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={simulateHighVolume}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium border-0"
        >
          {isLoading ? <PauseIcon /> : <ZapIcon />}
          {isLoading ? "Simulating..." : "Simulate High Volume"}
        </button>

        <button
          onClick={toggleAutoMode}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium border-0"
        >
          {autoMode ? <PauseIcon /> : <PlayIcon />}
          {autoMode ? "Stop Auto" : "Auto Mode"}
        </button>

        <button
          onClick={resetSimulation}
          className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium border-0"
        >
          <RotateCcwIcon />
          Reset
        </button>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <InfoIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{blocks.length}</p>
              <p className="text-blue-700 font-medium">Total Blocks</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUpIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{confirmedBlocks}</p>
              <p className="text-green-700 font-medium">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUpIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{avgConfirmationTime.toFixed(1)}s</p>
              <p className="text-purple-700 font-medium">Avg Confirmation</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUpIcon />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-900">{throughput.toFixed(1)}</p>
              <p className="text-orange-700 font-medium">TPS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-200/50 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <TrendingUpIcon />
          </div>
          BlockDAG Visualization
        </h3>
        {renderCustomVisualization()}
      </div>

      {/* Block Inspector */}
      {selectedBlock && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <InfoIcon />
            </div>
            Block Inspector
          </h3>
          {renderBlockInspector()}
        </div>
      )}

      {/* No blocks message */}
      {blocks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UsersIcon />
          </div>
          <p className="text-gray-500 text-lg font-medium">
            No blocks yet. Add your first DeFi transaction to get started!
          </p>
        </div>
      )}
    </div>
  )
}

export { BlockDAGSimulationComponent as BlockDAGSimulation }
export default BlockDAGSimulationComponent
