'use client'

import { Card } from "@/components/ui/card"

type Props = {
  stats: {
    total: number
    menunggu: number
    diproses: number
    selesai: number
    palsu: number
  }
}

export default function UserStats({ stats }: Props) {

  const items = [
    {
      label: "Total Laporan",
      value: stats.total,
      color: "text-gray-700"
    },
    {
      label: "Menunggu",
      value: stats.menunggu,
      color: "text-yellow-600"
    },
    {
      label: "Diproses",
      value: stats.diproses,
      color: "text-blue-600"
    },
    {
      label: "Selesai",
      value: stats.selesai,
      color: "text-green-600"
    },
    {
      label: "Palsu",
      value: stats.palsu,
      color: "text-red-600"
    }
  ]

  return (
    <div className="grid md:grid-cols-5 gap-4 mb-10">

      {items.map((item, i) => (

        <Card key={i} className="p-6">

          <p className="text-sm text-muted-foreground">
            {item.label}
          </p>

          <p className={`text-3xl font-bold mt-2 ${item.color}`}>
            {item.value}
          </p>

        </Card>

      ))}

    </div>
  )
}