import React, { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { Card, Text, Flex, Heading, Box } from '@sanity/ui'

const InstallCountWidget = () => {
  const [count, setCount] = useState<number | null>(null)
  const client = useClient({ apiVersion: '2024-01-01' })

  useEffect(() => {
    // Query GROQ untuk menghitung dokumen 'installations' secara real-time
    const query = 'count(*[_type == "installations"])'
    
    client.fetch(query)
      .then(setCount)
      .catch((err) => console.error("Gagal mengambil data statistik:", err))
  }, [client])

  return (
    <Card 
      padding={4} 
      shadow={2} 
      radius={3} 
      style={{ 
        background: '#fff',
        borderTop: '5px solid #ffc107', // Aksen Kuning Emas PCM
        height: '100%'
      }}
    >
      <Flex direction="column" align="center" justify="center" gap={4} style={{ height: '100%' }}>
        {/* Judul dengan Biru PCM */}
        <Heading 
          size={1} 
          style={{ 
            color: '#004a8e', 
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          Total Penginstall
        </Heading>

        <Box>
          <Text 
            size={5} 
            weight="bold" 
            style={{ 
              fontSize: '64px', 
              color: '#1a1a1a',
              textShadow: '2px 2px 4px rgba(0,0,0,0.05)' 
            }}
          >
            {count !== null ? count.toLocaleString('id-ID') : '...'}
          </Text>
        </Box>

        <Flex align="center" gap={2}>
          {/* PERBAIKAN: Mengganti Box menjadi Card agar properti 'radius' valid */}
          <Card 
            padding={2} 
            radius={2} 
            style={{ background: '#f0f4f8', borderLeft: '3px solid #004a8e' }}
          >
            <Text size={1} weight="semibold" style={{ color: '#004a8e' }}>
              Aplikasi PCM Kembaran
            </Text>
          </Card>
        </Flex>
        
        <Text size={0} muted style={{ fontStyle: 'italic' }}>
          Data diperbarui secara otomatis
        </Text>
      </Flex>
    </Card>
  )
}

export default InstallCountWidget