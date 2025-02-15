import React, { FC, useState } from 'react';
import { Pane, Dialog, majorScale } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/client';
import Logo from '../../components/logo';
import FolderList from '../../components/folderList';
import NewFolderButton from '../../components/newFolderButton';
import User from '../../components/user';
import FolderPane from '../../components/folderPane';
import DocPane from '../../components/docPane';
import NewFolderDialog from '../../components/newFolderDialog';
import { connectToDB, doc, folder, user } from '../../db';
import { UserSession } from '../../types';

type PropsPage = {
  activeDoc: any;
  activeFolder: any;
  activeDocs: any[];
};

const Page = ({ activeDoc, activeFolder, activeDocs }: PropsPage) => {
  if (activeDoc) {
    return <DocPane folder={activeFolder} doc={activeDoc} />;
  }

  if (activeFolder) {
    return <FolderPane folder={activeFolder} docs={activeDocs} />;
  }

  return null;
};

const App: FC<{ folders?: any[]; activeFolder?: any; activeDoc?: any; activeDocs?: any[] }> = ({
  folders,
  activeDoc,
  activeFolder,
  activeDocs,
}) => {
  const router = useRouter();

  const [newFolderIsShown, setNewFolderIsShown] = useState(false);

  const [allFolders, setAllFolders] = useState(folders.length ? folders : []);

  const [session, loading] = useSession();

  const handleNewFolder = async (name: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/folder/`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { status, data } = await res.json();

    if (!status || !data) {
      return null;
    }

    setAllFolders((prev) => [...prev, data]);
  };

  if (loading) {
    return null;
  }

  if (!session && !loading) {
    return (
      <Dialog
        isShown
        title="Session expired"
        confirmLabel="Ok"
        hasCancel={false}
        hasClose={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
        onConfirm={() => router.push('/signin')}
      >
        Sign in to continue
      </Dialog>
    );
  }

  return (
    <Pane position="relative">
      <Pane width={300} position="absolute" top={0} left={0} background="tint2" height="100vh" borderRight>
        <Pane padding={majorScale(2)} display="flex" alignItems="center" justifyContent="space-between">
          <Logo />

          <NewFolderButton onClick={() => setNewFolderIsShown(true)} />
        </Pane>
        <Pane>
          <FolderList folders={allFolders} />{' '}
        </Pane>
      </Pane>
      <Pane marginLeft={300} width="calc(100vw - 300px)" height="100vh" overflowY="auto" position="relative">
        <User user={session.user} />
        <Page activeDoc={activeDoc} activeFolder={activeFolder} activeDocs={activeDocs} />
      </Pane>
      <NewFolderDialog
        close={() => setNewFolderIsShown(false)}
        isShown={newFolderIsShown}
        onNewFolder={handleNewFolder}
      />
    </Pane>
  );
};

App.defaultProps = {
  folders: [],
};

/**
 * Catch all handler. Must handle all different page
 * states.
 * 1. Folders - none selected
 * 2. Folders => Folder selected
 * 3. Folders => Folder selected => Document selected
 *
 * An unauth user should not be able to access this page.
 *
 * @param context
 */

export async function getServerSideProps(context) {
  const session: { user: UserSession } = await getSession(context);

  // * not signed in
  if (!session?.user) {
    return { props: {} };
  }

  const props: any = { session };
  const { db } = await connectToDB();
  const folders = await folder.getFolders(db, session.user.id);
  props.folders = folders;

  if (context.params.id) {
    const activeFolder = folders.find((f) => f._id === context.params.id[0]);
    const activeDocs = await doc.getDocsByFolder(db, activeFolder._id);

    props.activeFolder = activeFolder;
    props.activeDocs = activeDocs;

    const activeDocId = context.params.id![1];

    if (activeDocId) {
      props.activeDoc = await doc.getOneDoc(db, activeDocId);
    }
  }

  return {
    props,
  };
}

export default App;
