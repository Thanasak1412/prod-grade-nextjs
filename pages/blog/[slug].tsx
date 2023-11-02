import React, { FC } from 'react';
import hydrate from 'next-mdx-remote/hydrate';
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui';
import renderToString from 'next-mdx-remote/render-to-string';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Post } from '../../types';
import Container from '../../components/container';
import HomeNav from '../../components/homeNav';
import { getDir } from '../../utils/path';
import { posts } from '../../content';

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
  const content = hydrate(source);
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Pane width="100%" height="100%">
        <Spinner size={48} />
      </Pane>
    );
  }
  return (
    <Pane>
      <Head>
        <title>{`Known Blog | ${frontMatter.title}`}</title>
        <meta name="description" content={frontMatter.summary} />
      </Head>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          <Heading fontSize="clamp(2rem, 8vw, 6rem)" lineHeight="clamp(2rem, 8vw, 6rem)" marginY={majorScale(3)}>
            {frontMatter.title}
          </Heading>
          <Pane>{content}</Pane>
        </Container>
      </main>
    </Pane>
  );
};

BlogPost.defaultProps = {
  source: '',
  frontMatter: { title: 'default title', summary: 'summary', publishedOn: '' },
};

export function getStaticPaths() {
  const { filename, pathDir } = getDir('posts');

  const slugs = filename.map((name) => {
    const filePath = path.join(pathDir, name);

    const file = fs.readFileSync(filePath, 'utf-8');

    return matter(file).data;
  });

  return {
    paths: slugs.map((s) => ({ params: { slug: s.slug } })),
    fallback: true,
  };
}

type Params = {
  params: {
    slug: string;
  };
  preview: boolean;
};

export async function getStaticProps({ params, preview }: Params) {
  let postFile;
  try {
    const postPath = path.join(process.cwd(), 'posts', `${params.slug}.mdx`);
    postFile = fs.readFileSync(postPath, 'utf-8');
  } catch {
    // must be from cms or its a 404
    const cmsPosts = (preview ? posts.draft : posts.published).map((post) => ({
      ...matter(post),
    }));
    const match = cmsPosts.find((p) => p.data.slug === params.slug);

    postFile = match.content;
  }

  if (!postFile) {
    throw new Error('no post');
  }

  const { content, data } = matter(postFile);
  const mdxSource = await renderToString(content, { scope: data });

  return { props: { source: mdxSource, frontMatter: data }, revalidate: 30 };
}

/**
 * Need to get the paths here
 * then the the correct post for the matching path
 * Posts can come from the fs or our CMS
 */
export default BlogPost;
