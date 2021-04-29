import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
import axios from 'axios';
import { config } from '../../config';

const CATEGORY_LIST = 'CATEGORY_LIST';
const POST_LIST = 'POST_LIST';
const SCROLL_POST_LIST = 'SCROLL_POST_LIST';
const PAGING = 'PAGING';
const LOADING = 'LOADING';
const VIEW_LOADING = 'VIEW_LOADING';

const categoryList = createAction(CATEGORY_LIST, (list) => ({ list }));
const postList = createAction(POST_LIST, (post_list) => ({
  post_list,
}));
const scrollPostList = createAction(SCROLL_POST_LIST, (post_list) => ({
  post_list,
}));
const pagingInfo = createAction(PAGING, (paging) => ({ paging }));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));
const viewLoading = createAction(VIEW_LOADING, (view_loading) => ({
  view_loading,
}));

const initialState = {
  category_list: [],
  post_list: [],
  paging: {
    id: undefined,
    page: 1,
    size: 12,
    sort: 'popularity',
    direction: 'desc',
  },
  is_loading: false,
  view_loading: false,
};

const getCategoryDB = () => {
  return function (dispatch) {
    axios({
      method: 'get',
      url: `${config.api}/api/categorys`,
    })
      .then((res) => {
        dispatch(categoryList(res.data));
      })
      .catch((e) => {
        console.log('에러발생', e);
      });
  };
};

const getPostDB = (id, sort = 'popularity', direction = 'desc') => {
  return function (dispatch) {
    dispatch(viewLoading(true));
    axios({
      method: 'get',
      url: `${config.api}/api/categorys/${id}?page=0&size=12&sort=${sort}&direction=${direction}`,
    })
      .then((res) => {
        let paging = {
          id: id,
          page: 1,
          size: 12,
          sort: sort,
          direction: direction,
        };
        dispatch(postList(res.data.content));
        dispatch(pagingInfo(paging));
      })
      .catch((e) => {
        console.log('에러발생', e);
      });
  };
};

const scrollGetPostDB = () => {
  return function (dispatch, getState) {
    const _paging = getState().post.paging;
    const id = _paging.id;
    const page = _paging.page;
    const size = _paging.size;
    const sort = _paging.sort;
    const direction = _paging.direction;
    if (!page) {
      return;
    }
    dispatch(loading(true));
    axios({
      method: 'get',
      url: `${config.api}/api/categorys/${id}?page=${page}&size=${size}&sort=${sort}&direction=${direction}`,
    })
      .then((res) => {
        let paging = {
          id: id,
          page: res.data.totalPages !== page ? page + 1 : null,
          size: size,
          sort: sort,
          direction: direction,
        };
        dispatch(scrollPostList(res.data.content));
        dispatch(pagingInfo(paging));
      })
      .catch((e) => {
        console.log('에러발생', e);
      });
  };
};

export default handleActions(
  {
    [CATEGORY_LIST]: (state, action) =>
      produce(state, (draft) => {
        draft.category_list = action.payload.list;
      }),
    [POST_LIST]: (state, action) =>
      produce(state, (draft) => {
        draft.post_list = action.payload.post_list;
        draft.view_loading = false;
      }),
    [SCROLL_POST_LIST]: (state, action) =>
      produce(state, (draft) => {
        draft.post_list.push(...action.payload.post_list);
        draft.is_loading = false;
      }),
    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      }),
    [VIEW_LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.view_loading = action.payload.view_loading;
      }),
    [PAGING]: (state, action) =>
      produce(state, (draft) => {
        draft.paging = action.payload.paging;
      }),
  },
  initialState,
);

const actionCreators = {
  getCategoryDB,
  getPostDB,
  scrollGetPostDB,
};

export { actionCreators };
