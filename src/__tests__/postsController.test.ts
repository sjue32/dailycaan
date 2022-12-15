
import postsController from '../server/controllers/postsController';
import { Request, Response, NextFunction } from 'express';
import { ddbDocClient } from '../../libs/ddbDocClient';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
// PutCommand

import '@jest/globals';
import sampleGetPostData, { sampleAddUserPostData, 
  sampleUpdateUserPostData, sampleAddUserPostResponse, sampleUpdateUserPostResponse,
  sampleDeleteUserPostData, 
  sampleDeleteUserPostResponse} from '../sample/sampleGetPostData';

describe('getPublicPosts returns public posts', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');
  
  const mockReq: Partial<Request> = {
    body: {
      table_name: 'test_user_posts',
    }
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return mockRes as any;};

  beforeAll( async () => {
    queryMock.mockResolvedValue(sampleGetPostData as never);
    await postsController.getPublicPosts(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });

  afterAll( async () => {
    queryMock.mockReset();
  });

  it('returns reponse data from query', async () => {
    const { Items } = await queryMock.mock.results[0].value;
    expect(Items).toBeInstanceOf(Array);
  });

  it('calls db.query function', () => {
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('was given a QueryCommand instance', () => {
    expect(queryMock.mock.calls[0][0]).toBeInstanceOf(QueryCommand);
  });

  it('res.locals to contain an array', () => {
    expect(mockRes.locals).toBeInstanceOf(Array);
  });

  it('contains post data related to user_id 1', () => {
    expect(mockRes.locals[0].user_id).toBe(1);
  });

  it('contains links to jpeg images', () => {
    expect(/https/.test(mockRes.locals[0].url)).toBe(true);
    expect(/jpeg/.test(mockRes.locals[0].url)).toBe(true);
  });

});

describe('getPublicPosts throws error and triggers error handler', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');

  const mockReq: Partial<Request> = {
    params: {
      user_id: '1',
    },
    body: {
      user_id: 1,
    },
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return; };

  afterAll(() => {
    queryMock.mockReset();
  });

  it('throws an error when db.query returns an error', async () => {
    try {
      queryMock.mockRejectedValue(new Error('Error occured in postsController.getPublicPosts') as never);
      await postsController.getPublicPosts(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    } catch(err) {
      expect(err.message).toBe('Error occured in postsController.addUserPost');
    }
  }); 
});

describe('get posts for specific user', () => {

  const queryMock = jest.spyOn(ddbDocClient, 'send');

  const test_req_param = '1';
  const mockReq: Partial<Request> = { 
    params: {
      user_id: test_req_param,
    },
    body: {
      table_name: 'test_user_posts',
    }
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return mockRes as any;};

  beforeAll( async () => {
    queryMock.mockResolvedValue(sampleGetPostData as never);
    await postsController.getUserPosts(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });

  afterAll( async () => {
    queryMock.mockReset();
  });

  it('returns expected response data from queryMock', async () => {
    expect(await queryMock.mock.results[0].value).toBeInstanceOf(Object);
  });

  it('stores an array at mockRes.locals', () => {
    expect(mockRes.locals).toBeInstanceOf(Array);
  });

  it('contains post data related to user_id from req.params', () => {
    const data = mockRes.locals;
    expect(data[0].user_id).toBe(Number(test_req_param));
  });

  it('contains links to jpeg images', () => {
    const url = mockRes.locals[0].url;
    expect(/https/.test(url)).toBe(true);
    expect(/jpeg/.test(url)).toBe(true);
  });

});

describe('getUserPosts throws error and triggers error handler', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');
  const { user_id } = sampleGetPostData.Items[0];

  const mockReq: Partial<Request> = {
    params: {
      user_id: `${user_id}`,
    },
    body: {
      user_id: user_id,
    },
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return; };

  afterAll(() => {
    queryMock.mockReset();
  });

  it('throws an error when ddbDocClient.send returns an error', async () => {
    try {
      queryMock.mockRejectedValue(new Error('Error occured in postsController.getUserPosts') as never);
      await postsController.getPublicPosts(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    } catch(err) {
      expect(err.message).toBe('Error occured in postsController.getUserPosts');
    }
  }); 
});

describe('add post for specific user', () => {

  const queryMock = jest.spyOn(ddbDocClient, 'send');
  const sampleData = sampleAddUserPostData.Attributes[0];
  // add object to mockReq related to user's new post
  const user_data = {
    user_id: sampleData.user_id,
    url: sampleData.url,
    caption: sampleData.caption
  };
  const id = 2;
  //  when making a addPost, should we still use req.params, or store user_id in the body or both?
  // all requests seem to be related to a specific user at this time, so it makes sense to keep params
  // to organize the path of our requests
  const mockReq: Partial<Request> = {
    params: {
      user_id: `${id}`,
    },
    body: user_data,
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return;};


  beforeAll(async () => {
    // const successfulResponse = sampleAddUserPostData;
    queryMock.mockResolvedValue(sampleAddUserPostResponse as never);
    await postsController.addUserPost(mockReq as Request, mockRes as Response, mockNext as NextFunction);

  });

  afterAll(async () => {
    queryMock.mockReset();
  });

  it('mockRes has correct id', () => {
    expect(mockReq.params.user_id).toBe('2');
  });
  it('calls send function on ddbDocClient', () => {
    expect(queryMock).toHaveBeenCalledTimes(1);
  });
  it('returns an object with Attributes property set to undefined', async ()=> {
    const { Attributes } = await queryMock.mock.results[0].value;
    expect(Attributes).toEqual(undefined);
  });
  it('sets res.locals.message', async () => {
    expect(await mockRes.locals.message).toEqual('Item added');
  });
});

// save for describe block for error response from DB
describe('add user post with error triggers error handler', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');

  const sampleData = sampleAddUserPostData.Attributes[0];
  const user_data = {
    user_id: sampleData.user_id,
    url: sampleData.url,
    caption: sampleData.caption
  };
  const id = 2;
  const mockReq: Partial<Request> = {
    params: {
      user_id: `${id}`,
    },
    body: user_data,
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return; };

  afterAll(() => {
    queryMock.mockReset();
  });

  it('throws an error when db.query returns an error', async () => {
    try {
      queryMock.mockRejectedValue(new Error('Error occured in postsController.addUserPost') as never);
      await postsController.addUserPost(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    } catch(err) {
      expect(err.message).toBe('Error occured in postsController.addUserPost');
    }
  }); 

  // this requires the reject met
  // it('throws an error', async () => {
  //   expect(queryMock.toThrow('Error occured in postsController.addUserPost');
  // });


});

describe('Update post successful', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');
  // variables for mock dependencies
  // 
  const { user_id, timestamp, caption } = sampleUpdateUserPostData;
  const mockReq: Partial<Request> = {
    body: {
      user_id: user_id,
      caption: caption,
      timestamp: timestamp,
    }
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return; };

  beforeAll( async () => {
    queryMock.mockResolvedValue(sampleUpdateUserPostResponse as never);
    await postsController.updateUserPost(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });

  afterAll( async () => {
    queryMock.mockReset();
  });

  it('returns the updated Item from DB', async () => {
    expect(await queryMock.mock.results[0].value).toBe(sampleUpdateUserPostResponse);
  });
  it('stores an object from response at mockRes.locals', () => {
    expect(mockRes.locals).toBeInstanceOf(Object);
  });
  it('returns the updated caption', () => {
    const caption = sampleUpdateUserPostResponse.Attributes.caption;
    expect(mockRes.locals.caption).toBe(caption);
  });

});

describe('update user post with error triggers error handler', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');

  const { user_id, timestamp, caption } = sampleUpdateUserPostData;

  const mockReq: Partial<Request> = {
    params: {
      user_id: `${user_id}`,
    },
    body: {
      user_id: user_id,
      timestamp: timestamp,
      caption: caption,
    }
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return;};

  afterAll( async () => {
    queryMock.mockReset();
  });


  it('throws an error when ddbDocClient.send returns an error', async () => {
    try {
      queryMock.mockRejectedValue(new Error('Error occured in postsController.updateUserPost') as never);
      await postsController.updateUserPost(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    } catch(err) {
      expect(err.message).toBe('Error occured in postsController.updateUserPost');
    }
  });
});

describe('Delete post successful', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');
  
  const { user_id, timestamp } = sampleDeleteUserPostData;
  const mockReq: Partial<Request> = {
    body: {
      user_id: user_id,
      timestamp: timestamp,
    },
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return; };

  beforeAll( async () => {
    queryMock.mockResolvedValue(sampleDeleteUserPostResponse as never);
    await postsController.deleteUserPost(mockReq as Request, mockRes as Response, mockNext as NextFunction);
  });
  afterAll(() => {
    queryMock.mockReset();
  });
  it('called ddbDocClient.send function', () => {
    expect(queryMock).toHaveBeenCalledTimes(1);
  });
  it('returns an object when ddbDocClient.send is called', async () => {
    const response = await queryMock.mock.results[0].value;
    expect(response).toBeInstanceOf(Object);
  });
  it('returns a status code of 200', async () => {
    const response = await queryMock.mock.results[0].value;
    const { httpStatusCode } = response['$metadata'];
    expect(httpStatusCode).toEqual(200);
  });
  it('stores correct user_id and timestamp at res.locals.deletedItem', () => {
    expect(mockRes.locals.user_id).toEqual(user_id);
    expect(mockRes.locals.timestamp).toEqual(timestamp);
  });

});

describe('delete user post with error triggers error handler', () => {
  const queryMock = jest.spyOn(ddbDocClient, 'send');

  const { user_id, timestamp } = sampleDeleteUserPostData;

  const mockReq: Partial<Request> = {
    params: {
      user_id: `${user_id}`,
    },
    body: {
      user_id: user_id,
      timestamp: timestamp,
    }
  };
  const mockRes: Partial<Response> = {};
  const mockNext: Partial<NextFunction> = function() { return; };

  afterAll( async () => {
    queryMock.mockReset();
  });


  it('throws an error when ddbDocClient.send returns an error', async () => {
    try {
      queryMock.mockRejectedValue(new Error('Error occured in postsController.deleteUserPost') as never);
      await postsController.deleteUserPost(mockReq as Request, mockRes as Response, mockNext as NextFunction);

    } catch(err) {
      expect(err.message).toBe('Error occured in postsController.updateUserPost');
    }
  });
});


