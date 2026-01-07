/**
 * GraphQL operations for media entity
 *
 * Note: These are raw GraphQL strings until we add them to codegen
 */

export const INSERT_MEDIA = /* GraphQL */ `
  mutation InsertMedia(
    $organization_id: String!
    $filename: String!
    $mime_type: String!
    $file_size_bytes: bigint!
    $storage_provider: String!
    $storage_bucket: String!
    $storage_path: String!
    $storage_region: String
    $entity_type: String!
    $entity_id: String
    $status: String!
    $uploaded_by: String
  ) {
    insert_media_one(
      object: {
        organization_id: $organization_id
        filename: $filename
        mime_type: $mime_type
        file_size_bytes: $file_size_bytes
        storage_provider: $storage_provider
        storage_bucket: $storage_bucket
        storage_path: $storage_path
        storage_region: $storage_region
        entity_type: $entity_type
        entity_id: $entity_id
        status: $status
        uploaded_by: $uploaded_by
      }
    ) {
      id
      organization_id
      filename
      mime_type
      file_size_bytes
      storage_path
      entity_type
      entity_id
      status
      created_at
      updated_at
    }
  }
`;

export const UPDATE_MEDIA_STATUS = /* GraphQL */ `
  mutation UpdateMediaStatus(
    $id: String!
    $status: String!
    $error_message: String
    $width: Int
    $height: Int
    $processing_metadata: jsonb
  ) {
    update_media_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: $status
        error_message: $error_message
        width: $width
        height: $height
        processing_metadata: $processing_metadata
      }
    ) {
      id
      status
      error_message
      width
      height
      updated_at
    }
  }
`;

export const FIND_MEDIA_BY_STORAGE_PATH = /* GraphQL */ `
  query FindMediaByStoragePath($storage_bucket: String!, $storage_path: String!) {
    media(
      where: {
        storage_bucket: { _eq: $storage_bucket }
        storage_path: { _eq: $storage_path }
      }
      limit: 1
    ) {
      id
      organization_id
      filename
      mime_type
      file_size_bytes
      storage_provider
      storage_bucket
      storage_path
      storage_region
      entity_type
      entity_id
      status
      error_message
      width
      height
      uploaded_by
      created_at
      updated_at
    }
  }
`;

export const FIND_MEDIA_BY_ID = /* GraphQL */ `
  query FindMediaById($id: String!) {
    media_by_pk(id: $id) {
      id
      organization_id
      filename
      mime_type
      file_size_bytes
      storage_provider
      storage_bucket
      storage_path
      storage_region
      entity_type
      entity_id
      status
      error_message
      width
      height
      uploaded_by
      created_at
      updated_at
    }
  }
`;
