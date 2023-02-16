/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UserTreeNodeService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param treeName 
     * @param parentNodeId 
     * @param nodeName 
     * @returns any 
     * @throws ApiError
     */
    public postApiUserTreeNodeCreate(
treeName: string,
parentNodeId: number,
nodeName: string,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api.user.tree.node.create',
            query: {
                'treeName': treeName,
                'parentNodeId': parentNodeId,
                'nodeName': nodeName,
            },
        });
    }

    /**
     * @param treeName 
     * @param nodeId 
     * @returns any 
     * @throws ApiError
     */
    public postApiUserTreeNodeDelete(
treeName: string,
nodeId: number,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api.user.tree.node.delete',
            query: {
                'treeName': treeName,
                'nodeId': nodeId,
            },
        });
    }

    /**
     * @param treeName 
     * @param nodeId 
     * @param newNodeName 
     * @returns any 
     * @throws ApiError
     */
    public postApiUserTreeNodeRename(
treeName: string,
nodeId: number,
newNodeName: string,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api.user.tree.node.rename',
            query: {
                'treeName': treeName,
                'nodeId': nodeId,
                'newNodeName': newNodeName,
            },
        });
    }

}
