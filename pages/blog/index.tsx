import React from 'react'
import { Pane, majorScale } from 'evergreen-ui'
import matter from 'gray-matter'
import path from 'path'
import fs from 'fs'
import orderby from 'lodash.orderby'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import PostPreview from '../../components/postPreview'
import { posts as postsFromCMS } from '../../content'
import { getDir } from '../../utils/path'

type Props = {
  posts: {
    title: string
    summary: string
    slug: string
  }[]
}

const Blog = ({ posts }: Props) => {
  return (
    <Pane>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          {posts.map((post) => (
            <Pane key={post.title} marginY={majorScale(5)}>
              <PostPreview post={post} />
            </Pane>
          ))}
        </Container>
      </main>
    </Pane>
  )
}

Blog.defaultProps = {
  posts: [],
}

export function getStaticProps({ preview }) {
  const cmsPosts = (preview ? postsFromCMS.draft : postsFromCMS.published).map((post) => ({
    ...matter(post).data,
  }))

  const { filename, pathDir } = getDir('posts')

  const filePosts = filename.map((name) => {
    const fullPathFile = path.join(pathDir, name)
    const fileContent = fs.readFileSync(fullPathFile, 'utf-8')

    return matter(fileContent).data
  })

  const posts = orderby([...cmsPosts, ...filePosts], ['publishedOn'], ['desc'])

  return {
    props: {
      posts,
    },
  }
}

export default Blog

/**
 * Need to get the posts from the
 * fs and our CMS
 */
