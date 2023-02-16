import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { AppClient } from './apiSchema';
import { Ttree } from './apiSchema/models/ReactTest_Tree_Site_Model_MNode';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';
import { AddOutlined, EditOutlined, DeleteForeverOutlined} from '@mui/icons-material';
export const api = new AppClient({
  BASE: 'https://test.vmarmysh.com',
});

type TRenderTree = {
  tree: Ttree;
  addNode: (id: Ttree['id'], name: Ttree['name']) => void;
  renameNode: (id: Ttree['id'], name: Ttree['name']) => void;
  deleteNode: (id: Ttree['id'], name: Ttree['name']) => void;
};

const RenderTree = ({ tree, addNode, renameNode, deleteNode }: TRenderTree) => {
  const [isSelected, setIsSelected] = useState(false);
  const actions = <Box sx={{
    opacity: 0,
    transition: 'opacity 200ms ease-in-out',
    position: 'absolute',
    right: '-32px',
    top: '50%',
    transform: 'translateY(-50%)'
  }} >
    <IconButton  aria-label='add' sx={{color: '#fff'}} onClick={() => addNode(tree.id, tree.name)}>
      <AddOutlined fontSize='small' />
    </IconButton>
    <IconButton  aria-label='add' color='primary' onClick={() => renameNode(tree.id, tree.name)}>
      <EditOutlined fontSize='small' />
    </IconButton>
    <IconButton  aria-label='add' color='error' onClick={() => deleteNode(tree.id, tree.name)}>
      <DeleteForeverOutlined fontSize='small' />
    </IconButton>
  </Box>
  const recursiveNode = tree?.children?.map((item) => (
    <RenderTree key={item.id} tree={item} renameNode={renameNode} deleteNode={deleteNode} addNode={() => addNode(item.id, item.name)} />
  ))
  if (!!tree?.children?.length) {
    return <details open={isSelected} className={`node${isSelected ? " node--selected" : ''}`} onClick={() => setIsSelected(prev => !prev)}>
    <summary className='node__summary'>
      {tree.name} {actions}
    </summary>
    {recursiveNode}
  </details>
  }
  return (
    <Box className={`node${isSelected ? " node--selected" : ''}`} onClick={() => setIsSelected(prev => !prev)}>
      <Box>{tree.name} {actions}</Box>
      {recursiveNode}
    </Box>
  );
};

enum ETypes {
  TREE = 'tree',
  NODE = 'node',
  RENAME = 'rename'
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [tree, setTree] = useState<Ttree>();
  const [popupData, setPopupData] = useState<{
    type: ETypes;
    parentNodeId?: number;
    name?: string;
    id?: number;
  } | null>(null);

  const fetchTree = useCallback(
    () =>
      api.userTree
        .postApiUserTreeGet('testTree')
        .then((res) => {
          setTree(res);
        })
        .catch((err) => console.log(err))
        .finally(() => isLoading && setTimeout(() => setIsLoading(false), 500)),
    [isLoading]
  );

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const addNode = useCallback((id: number, name: string) => {
    setPopupData({ type: ETypes.NODE, id, name });
  }, []);

  const renameNode = useCallback(() => {
    api.userTreeNode.postApiUserTreeNodeRename().then(res => console.log(res))
  })

  const deleteNode = useCallback(() => {
    api.userTreeNode.postApiUserTreeNodeDelete().then(res => console.log(res))
  })

  const onCreateTreeBtnClick = useCallback(() => setPopupData({
    type: ETypes.TREE,
  }),[])
  
  const onPopupClose = useCallback(() => setPopupData(null), []);
  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      input: popupData?.name || '',
    },
    onSubmit: ({input}) => {
      if (popupData?.type === ETypes.RENAME && tree?.name && popupData.id) {
        api.userTreeNode.postApiUserTreeNodeRename(tree?.name, popupData.id, input).then(res => console.log(res))
      }
      if (popupData?.type === ETypes.NODE && tree?.name && popupData?.parentNodeId) {
        api.userTreeNode.postApiUserTreeNodeCreate(tree?.name, popupData?.parentNodeId, input).then((res) => {
          fetchTree();
        });
      }
      if (popupData?.type === ETypes.TREE && input) {
        api.userTree.postApiUserTreeGet(input).then((res: Ttree) => fetchTree())
      }
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      input: Yup.string().required(),
    }),
  });

  return (
    <div className='App'>
      {isLoading ? (
        <Box
          sx={{
            padding: '75px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CircularProgress
            sx={{
              margin: '0 auto',
            }}
          />
        </Box>
      ) : (
        <>
          <Dialog open={!!popupData} onClose={onPopupClose}>
            <DialogTitle>Add {popupData?.type}</DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Input name='input' type='text' onChange={handleChange} value={values.input} />
              </DialogContent>
              <DialogActions>
                <Button variant='contained' color='error' onClick={onPopupClose}>Cancel</Button>
                <Button variant='contained' color='primary' type='submit'>Add</Button>
              </DialogActions>
            </form>
          </Dialog>

          {tree ? <RenderTree tree={tree} addNode={addNode} /> : <Button variant='text' color='primary' onClick={onCreateTreeBtnClick}>Create tree</Button>}
        </>
      )}
    </div>
  );
}

export default App;
