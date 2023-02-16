import { useCallback, useEffect, useState } from 'react';
import { AppClient } from './apiSchema';
import { Ttree } from './apiSchema/models/ReactTest_Tree_Site_Model_MNode';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';

import { AddOutlined, EditOutlined, DeleteForeverOutlined, PlayArrowOutlined } from '@mui/icons-material';
export const api = new AppClient({
  BASE: 'https://test.vmarmysh.com',
});

type TRenderTree = {
  tree: Ttree;
  selectedNode?: Ttree;
  parentNodeId: number;
  isMainNode: boolean;
  selectNodeHandler: (node: Ttree) => void;
  addNode: (id: Ttree['id'], name: Ttree['name']) => void;
  renameNode: (id: Ttree['id'], name: Ttree['name']) => void;
  deleteNode: (node: Ttree, parentNodeId: number) => void;
};

const RenderTree = ({
  isMainNode,
  parentNodeId,
  tree,
  selectedNode,
  selectNodeHandler,
  addNode,
  renameNode,
  deleteNode,
}: TRenderTree) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedNode?.id === tree.id;
  return (
    <Box
      sx={{
        marginLeft: '8px',
      }}
    >
      <Box
        onClick={() => {
          setIsOpen((prev) => !prev);
          selectNodeHandler(tree);
        }}
        sx={{
          padding: '8px',
          width: 'max-content',
          userSelect: 'none',
          cursor: 'pointer',
          backgroundColor: isSelected ? 'rgba(66,165,245, 0.4)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <PlayArrowOutlined
          sx={{
            opacity: +!!tree?.children?.length,
            transition: 'transform 200ms ease-in-out',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            marginRight: '8px',
          }}
        />
        <Box>{tree.name}</Box>
        {isSelected && (
          <Box
            sx={{
              marginLeft: '12px',
            }}
          >
            <IconButton
              aria-label='add'
              sx={{ color: '#fff' }}
              onClick={(e) => {
                e.stopPropagation();
                addNode(tree.id, tree.name);
              }}
            >
              <AddOutlined fontSize='small' />
            </IconButton>
            {!isMainNode && (
              <>
                <IconButton
                  aria-label='add'
                  color='primary'
                  onClick={(e) => {
                    e.stopPropagation();
                    renameNode(tree.id, tree.name);
                  }}
                >
                  <EditOutlined fontSize='small' />
                </IconButton>
                <IconButton
                  aria-label='add'
                  color='error'
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(tree, parentNodeId);
                  }}
                >
                  <DeleteForeverOutlined fontSize='small' />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </Box>
      {isOpen &&
        tree?.children?.map((item) => (
          <RenderTree
            isMainNode={false}
            key={item.id}
            parentNodeId={tree.id}
            tree={item}
            selectedNode={selectedNode}
            selectNodeHandler={selectNodeHandler}
            renameNode={renameNode}
            deleteNode={deleteNode}
            addNode={addNode}
          />
        ))}
    </Box>
  );
};

enum ETypes {
  TREE = 'tree',
  NODE = 'node',
  RENAME = 'rename',
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [deletePopupData, setDeletePopupData] = useState<Ttree | null>();
  const [tree, setTree] = useState<Ttree>();
  const [formError, setFormError] = useState('');
  const [popupData, setPopupData] = useState<{
    type: ETypes;
    parentNodeId?: number;
    name?: string;
    id?: number;
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<Ttree>();
  const fetchTree = useCallback(() => {
    const treeName = localStorage.getItem('treeName');
    if (treeName) {
      api.userTree
        .postApiUserTreeGet(treeName)
        .then((res) => {
          setTree(res);
        })
        .catch((err) => console.log(err))
        .finally(() => isLoading && setTimeout(() => setIsLoading(false), 500));
    } else {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const onPopupClose = useCallback(() => {
    setPopupData(null);
    setFormError('');
  }, []);
  const onDeletePopupClose = useCallback(() => setDeletePopupData(null), []);

  const addNodeClick = useCallback((id: number, name: string) => {
    setPopupData({ type: ETypes.NODE, id, name });
  }, []);

  const renameNodeClick = useCallback((id: number, name: string) => {
    setPopupData({ type: ETypes.RENAME, id, name });
  }, []);

  const deleteNodeClick = useCallback((node: Ttree) => {
    setDeletePopupData(node);
  }, []);

  const submitDelete = useCallback(() => {
    if (tree?.name && deletePopupData?.id) {
      api.userTreeNode
        .postApiUserTreeNodeDelete(tree.name, deletePopupData?.id)
        .then((res) => {
          onDeletePopupClose();
          fetchTree();
        })
        .catch((err) => {
          if (err) {
            setFormError('You have to delete all children nodes first');
          }
        });
    }
  }, [tree?.name, deletePopupData?.id, onDeletePopupClose]);

  const selectNodeHandler = useCallback((node: Ttree) => setSelectedNode(node), []);

  const onCreateTreeBtnClick = useCallback(
    () =>
      setPopupData({
        type: ETypes.TREE,
      }),
    []
  );

  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      input: popupData?.type === ETypes.RENAME ? popupData?.name || '' : '',
    },
    onSubmit: ({ input }) => {
      if (popupData?.type === ETypes.RENAME && tree?.name && popupData.id) {
        api.userTreeNode.postApiUserTreeNodeRename(tree?.name, popupData.id, input).then(() => {
          fetchTree();
          onPopupClose();
        });
      }
      if (popupData?.type === ETypes.NODE && tree?.name && popupData?.id) {
        api.userTreeNode
          .postApiUserTreeNodeCreate(tree?.name, popupData?.id, input)
          .then(() => {
            fetchTree();
            onPopupClose();
          })
          .catch((err) => setFormError(err.body.data.message));
      }
      if (popupData?.type === ETypes.TREE && input) {
        api.userTree.postApiUserTreeGet(input).then(() => {
          localStorage.setItem('treeName', input);
          fetchTree();
          onPopupClose();
        });
      }
    },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      input: Yup.string().required(),
    }),
  });
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        maxWidth: '1280px',
        padding: '2rem',
        minWidth: '600px',
        margin: '0 auto',
        '@media(max-width: 767px)': {
          maxWidth: '100%',
          padding: '24px 12px',
          minWidth: 'unset',
        },
      }}
    >
      {isLoading ? (
        <Box
          sx={{
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
          {!!popupData && (
            <Dialog open={!!popupData} onClose={onPopupClose}>
              <DialogTitle>{popupData?.type === ETypes.RENAME ? 'Rename node' : `Add ${popupData?.type}`}</DialogTitle>
              <form onSubmit={handleSubmit}>
                <DialogContent>
                  {formError ? (
                      <Typography color='error'>{formError}</Typography>
                  ) : (
                    <Input name='input' type='text' onChange={handleChange} value={values.input} />
                  )}
                </DialogContent>
                <DialogActions>
                  <Button variant='contained' color='error' onClick={onPopupClose}>
                    Cancel
                  </Button>
                  {!formError && (
                    <Button variant='contained' color='primary' type='submit'>
                      Add
                    </Button>
                  )}
                </DialogActions>
              </form>
            </Dialog>
          )}
          {!!deletePopupData && (
            <Dialog open={!!deletePopupData} onClose={onDeletePopupClose}>
              <DialogTitle>{formError ? 'Delete' : 'Do you really want to delete this node?'}</DialogTitle>
              {formError && (
                <DialogContent>
                  <Typography color='error'>{formError}</Typography>
                </DialogContent>
              )}
              <DialogActions>
                <Button variant='contained' color='primary' onClick={onDeletePopupClose}>
                  Cancel
                </Button>
                {!formError && (
                  <Button onClick={submitDelete} variant='contained' color='error' type='submit'>
                    Delete
                  </Button>
                )}
              </DialogActions>
            </Dialog>
          )}
          {tree ? (
            <RenderTree
              tree={tree}
              isMainNode={true}
              parentNodeId={tree.id}
              renameNode={renameNodeClick}
              deleteNode={deleteNodeClick}
              addNode={addNodeClick}
              selectedNode={selectedNode}
              selectNodeHandler={selectNodeHandler}
            />
          ) : (
            <Button
              sx={{
                margin: '0 auto',
                display: 'block',
              }}
              variant='text'
              color='primary'
              onClick={onCreateTreeBtnClick}
            >
              Create tree
            </Button>
          )}
        </>
      )}
    </Box>
  );
}

export default App;
