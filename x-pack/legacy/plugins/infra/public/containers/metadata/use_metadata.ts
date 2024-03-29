/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useEffect } from 'react';
import { InfraNodeType } from '../../graphql/types';
import { InfraMetricLayout } from '../../pages/metrics/layouts/types';
import { InfraMetadata, InfraMetadataRT } from '../../../common/http_api/metadata_api';
import { getFilteredLayouts } from './lib/get_filtered_layouts';
import { useHTTPRequest } from '../../hooks/use_http_request';
import { throwErrors, createPlainError } from '../../../common/runtime_types';

export function useMetadata(
  nodeId: string,
  nodeType: InfraNodeType,
  layouts: InfraMetricLayout[],
  sourceId: string
) {
  const decodeResponse = (response: any) => {
    return InfraMetadataRT.decode(response).getOrElseL(throwErrors(createPlainError));
  };

  const { error, loading, response, makeRequest } = useHTTPRequest<InfraMetadata>(
    '/api/infra/metadata',
    'POST',
    JSON.stringify({
      nodeId,
      nodeType,
      sourceId,
      decodeResponse,
    })
  );

  useEffect(() => {
    (async () => {
      await makeRequest();
    })();
  }, [makeRequest]);

  return {
    name: (response && response.name) || '',
    filteredLayouts: (response && getFilteredLayouts(layouts, response.features)) || [],
    error: (error && error.message) || null,
    loading,
  };
}
