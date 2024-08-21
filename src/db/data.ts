import { v4 as uuidv4 } from 'uuid';
import {
  deleteD1ByTableAndId,
  getD1DataByTable,
  insertD1Data,
  updateD1Data,
} from './d1-data';

export async function getRecords(
  ctx,
  table,
  params,
  customDataFunction: undefined | Function = undefined
): Promise<{ data: any; source: string; total: number; contentType?: any }> {
  let d1Data;
  let total = 0;

  if (customDataFunction) {
    d1Data = await customDataFunction();
    if (d1Data && d1Data[0]) {
      total = d1Data[0].total;
    } else if (Object.keys(d1Data).length) {
      total = 1;
    }
  } else {
    d1Data = await getD1DataByTable(ctx.env.D1DATA, table, params);
  }

  if (d1Data?.length) {
    total = d1Data[0].total;
  } else if (d1Data) {
    total = 1;
    d1Data.total = undefined;
  }

  return { data: d1Data, source: 'd1', total };
}

export async function insertRecord(d1, data) {
  const content = data;
  const id = uuidv4();
  content.data.id = id;
  let error = '';

  try {
    const result = await insertD1Data(d1, content.table, content.data);
    return { code: 201, data: result };
  } catch (error) {
    error =
      'error posting content ' +
      content.data.table +
      error +
      JSON.stringify(content.data, null, 2);
  }
  return { code: 500, error };
}

export async function updateRecord(d1, data, params: Record<string, any>) {
  try {
    const result = await updateD1Data(d1, data.table, data, params);
    return { code: 200, data: result };
  } catch (error) {
    console.log('error posting content', error);
    return { code: 500, message: error };
  }
}

export async function deleteRecord(d1, data) {
  try {
    await deleteD1ByTableAndId(d1, data.table, data.id);
  } catch (error) {
    console.log('error deleting content', error);
    return { code: 500, message: error };
  }
}
