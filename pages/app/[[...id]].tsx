import React, { FC, useState } from 'react';
import { Pane, Dialog, majorScale } from 'evergreen-ui';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import Logo from '../../components/logo';
import FolderList from '../../components/folderList';
import NewFolderButton from '../../components/newFolderButton';
import User from '../../components/user';
import FolderPane from '../../components/folderPane';
import DocPane from '../../components/docPane';
import NewFolderDialog from '../../components/newFolderDialog';

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

  const [session, loading] = useSession();

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
          <FolderList folders={[{ _id: 1, name: 'test' }]} />{' '}
        </Pane>
      </Pane>
      <Pane marginLeft={300} width="calc(100vw - 300px)" height="100vh" overflowY="auto" position="relative">
        <User user={session.user} />
        <Page activeDoc={activeDoc} activeFolder={activeFolder} activeDocs={activeDocs} />
      </Pane>
      <NewFolderDialog close={() => setNewFolderIsShown(false)} isShown={newFolderIsShown} onNewFolder={() => {}} />
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
export default App;
