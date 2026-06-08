import React from 'react'
import { Card, Text, Flex, Heading, Stack, Badge, Box } from '@sanity/ui'

const ProjectDetailsWidget = () => {
  return (
    <Card 
      padding={4} 
      shadow={2} 
      radius={3} 
      style={{ 
        background: '#fff', 
        borderTop: '5px solid #004a8e', // Warna Biru Khas PCM
        height: '100%' 
      }}
    >
      <Stack space={4}>
        {/* Judul Panel Informasi */}
        <Heading 
          size={1} 
          style={{ 
            color: '#004a8e',
            letterSpacing: '0.5px' 
          }}
        >
          INFORMASI PROYEK PCM KEMBARAN
        </Heading>
        
        <Stack space={3}>
          {/* Baris Project ID */}
          <Flex justify="space-between" align="center">
            <Text size={1} weight="semibold">Project ID</Text>
            <Badge tone="caution" padding={2} radius={2}>
              deyoeizv
            </Badge>
          </Flex>
          
          {/* Baris Dataset */}
          <Flex justify="space-between" align="center">
            <Text size={1} weight="semibold">Dataset</Text>
            <Badge tone="positive" padding={2} radius={2}>
              production
            </Badge>
          </Flex>
          
          {/* Baris Status Koneksi */}
          <Flex justify="space-between" align="center">
            <Text size={1} weight="semibold">Status Studio</Text>
            <Flex align="center" gap={2}>
              <Text size={1} style={{ color: '#22863a' }}>● Terhubung</Text>
              <Badge tone="default">v3.0</Badge>
            </Flex>
          </Flex>
        </Stack>

        {/* Footer Kecil untuk Estetika Dashboard */}
        <Box paddingTop={2} style={{ borderTop: '1px solid #f0f0f0' }}>
          <Text size={0} muted style={{ fontStyle: 'italic' }}>
            Sistem Informasi Digital PCM Kembaran
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

export default ProjectDetailsWidget