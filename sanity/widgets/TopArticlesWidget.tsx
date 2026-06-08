import React, { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { Card, Text, Flex, Heading, Stack, Box, Badge } from '@sanity/ui'

const TopArticlesWidget = () => {
  const [posts, setPosts] = useState<any[]>([])
  const client = useClient({ apiVersion: '2024-01-01' })

  useEffect(() => {
    // GROQ: Mengambil 5 naskah/berita dengan jumlah pembaca (views) terbanyak
    const query = '*[_type == "post"] | order(views desc) [0...5] { _id, title, views }'
    
    client.fetch(query)
      .then(setPosts)
      .catch((err) => console.error("Gagal mengambil data artikel populer:", err))
  }, [client])

  return (
    <Card 
      padding={4} 
      shadow={2} 
      radius={3} 
      style={{ 
        background: '#fff',
        borderTop: '5px solid #ffc107', // Aksen Kuning Matahari Muhammadiyah
        height: '100%'
      }}
    >
      <Stack space={4}>
        {/* Header Widget Formal Biru PCM */}
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
          5 Artikel Terpopuler
        </Heading>
        
        {posts.length > 0 ? (
          <Stack space={3}>
            {posts.map((post, idx) => (
              <Flex 
                key={post._id || idx} 
                justify="space-between" 
                align="center" 
                style={{ 
                  padding: '10px 0', 
                  borderBottom: idx === posts.length - 1 ? 'none' : '1px dotted #eee' 
                }}
              >
                {/* Waduh judulnya panjang? Kita gunakan Elipsis agar tetap rapi */}
                <Box style={{ flex: 1, paddingRight: '15px' }}>
                  <Text 
                    weight="bold" 
                    size={1} 
                    style={{ 
                      color: '#1a1a1a',
                      display: 'block', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {idx + 1}. {post.title}
                  </Text>
                </Box>

                {/* Indikator Jumlah Pembaca (Views) */}
                <Badge tone="primary" padding={2} radius={2}>
                  <Flex align="center" gap={2}>
                    <Text size={0} weight="bold">{post.views || 0}</Text>
                    <Text size={0}>Mata</Text>
                  </Flex>
                </Badge>
              </Flex>
            ))}
          </Stack>
        ) : (
          <Flex align="center" justify="center" style={{ height: '150px' }}>
            <Text size={1} muted>Data pembaca belum tersedia.</Text>
          </Flex>
        )}
      </Stack>
    </Card>
  )
}

export default TopArticlesWidget