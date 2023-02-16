/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReactTest_Tree_Site_Model_MNode } from '../models/ReactTest_Tree_Site_Model_MNode';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UserTreeService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param treeName 
     * @returns ReactTest_Tree_Site_Model_MNode 
     * @throws ApiError
     */
    public postApiUserTreeGet(
treeName: string,
): CancelablePromise<ReactTest_Tree_Site_Model_MNode> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api.user.tree.get',
            query: {
                'treeName': treeName,
            },
        });
    }

}
