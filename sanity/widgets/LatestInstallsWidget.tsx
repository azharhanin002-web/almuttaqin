import React, { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { Card, Text, Flex, Heading, Stack, Box, Badge } from '@sanity/ui'

const LatestInstallsWidget = () => {
  const [installs, setInstalls] = useState<any[]>([])
  const client = useClient({ apiVersion: '2024-01-01' })

  useEffect(() => {
    // Mengambil 5 data instalasi terbaru dari database
    const query = '*[_type == "installations"] | order(installedAt desc) [0...5]'
    
    client.fetch(query)
      .then(setInstalls)
      .catch((err) => console.error("Gagal mengambil daftar instalasi:", err))
  }, [client])

  return (
    <Card 
      padding={4} 
      shadow={2} 
      radius={3} 
      style={{ 
        background: '#fff',
        borderTop: '5px solid #ffc107', // Konsisten dengan aksen Kuning PCM
        height: '100%'
      }}
    >
      <Stack space={4}>
        {/* Header Widget yang Serasi */}
        <Heading 
          size={1} 
          style={{ 
            color: '#004a8e', 
            letterSpacing: '1px',
            textTransform: 'uppercase',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '12px'
          }}
        >
          5 Instalasi Terakhir
        </Heading>
        
        {installs.length > 0 ? (
          <Stack space={3}>
            {installs.map((item, idx) => (
              <Flex 
                key={item._id || idx} 
                justify="space-between" 
                align="center" 
                style={{ 
                  padding: '10px 0', 
                  borderBottom: idx === installs.length - 1 ? 'none' : '1px dotted #eee' 
                }}
              >
                <Flex align="center" gap={3}>
                  {/* PERBAIKAN: Mengganti Box menjadi Card agar properti 'radius' valid */}
                  <Card 
                    padding={2} 
                    radius={2} 
                    style={{ background: '#f0f4f8' }}
                  >
                    <Text size={0} weight="bold" style={{ color: '#004a8e' }}>
                      {item.platform === 'Android' ? '📱' : '🌐'}
                    </Text>
                  </Card>
                  
                  <Box>
                    <Text weight="bold" size={1} style={{ color: '#1a1a1a' }}>
                      {item.platform || 'PWA/Android'}
                    </Text>
                    <Box marginTop={1}>
                      <Text size={0} muted>
                        {item.deviceName || 'Perangkat Anonim'}
                      </Text>
                    </Box>
                  </Box>
                </Flex>

                <Badge tone="default" padding={2} radius={2}>
                  <Text size={0} weight="semibold">
                    {new Date(item.installedAt).toLocaleString('id-ID', { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </Badge>
              </Flex>
            ))}
          </Stack>
        ) : (
          <Flex align="center" justify="center" style={{ height: '150px' }}>
            <Text size={1} muted>Belum ada aktivitas instalasi baru.</Text>
          </Flex>
        )}
      </Stack>
    </Card>
  )
}

export default LatestInstallsWidget