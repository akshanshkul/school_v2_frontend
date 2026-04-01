import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from '../api/axios'

interface SchoolData {
  grades: any[];
  sections: any[];
  classes: any[];
  subjects: any[];
  classrooms: any[];
  teachers: any[];
  events: any[];
  role_configs?: any[];
  periods: any[];
}

export interface AppState {
  schoolData: SchoolData | null;
  timetable: any[];
  events: any[];
  attendance: any[];
  loading: boolean;
  error: string | null;
}

export const fetchSchoolData = createAsyncThunk('app/fetchSchoolData', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/school/data')
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch school data')
  }
})

export const fetchTimetable = createAsyncThunk('app/fetchTimetable', async (filters: any, { rejectWithValue }) => {
  try {
    const response = await axios.get('/timetable', { params: filters })
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetable')
  }
})

export const fetchAttendance = createAsyncThunk('app/fetchAttendance', async (date: string, { rejectWithValue }) => {
  try {
    const response = await axios.get('/school/attendance', { params: { date } })
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance')
  }
})

export const markAttendance = createAsyncThunk('app/markAttendance', async (payload: { date: string, records: any[] }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/attendance/mark', payload)
    return response.data.records
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit attendance')
  }
})

// Create Thunks
export const createGrade = createAsyncThunk('app/createGrade', async (data: { name: string }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/grades', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create grade')
  }
})

export const createSection = createAsyncThunk('app/createSection', async (data: { name: string }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/sections', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create section')
  }
})

export const createClass = createAsyncThunk('app/createClass', async (data: { grade_id: number, section_id: number, class_teacher_id?: number, default_classroom_id?: number }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/classes', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create class')
  }
})

export const updateClass = createAsyncThunk('app/updateClass', async ({id, data}: { id: number, data: any }, { rejectWithValue }) => {
  try {
    const response = await axios.patch(`/school/classes/${id}`, data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update class')
  }
})

export const createSubject = createAsyncThunk('app/createSubject', async (data: { name: string, code?: string }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/subjects', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create subject')
  }
})

export const createClassroom = createAsyncThunk('app/createClassroom', async (data: { name: string, capacity?: number }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/classrooms', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create classroom')
  }
})

export const createTeacher = createAsyncThunk('app/createTeacher', async (data: FormData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/teachers', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create teacher')
  }
})

// Delete Thunks
export const deleteGrade = createAsyncThunk('app/deleteGrade', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/grades/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete grade')
  }
})

export const deleteSection = createAsyncThunk('app/deleteSection', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/sections/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete section')
  }
})

export const deleteClass = createAsyncThunk('app/deleteClass', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/classes/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete class')
  }
})

export const deleteSubject = createAsyncThunk('app/deleteSubject', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/subjects/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete subject')
  }
})

export const deleteClassroom = createAsyncThunk('app/deleteClassroom', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/classrooms/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete classroom')
  }
})

export const deleteTeacher = createAsyncThunk('app/deleteTeacher', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/teachers/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete teacher')
  }
})

export const createEvent = createAsyncThunk('app/createEvent', async (data: any, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/events', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create event')
  }
})

export const deleteEvent = createAsyncThunk('app/deleteEvent', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/events/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete event')
  }
})

export const createPeriod = createAsyncThunk('app/createPeriod', async (data: any, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/periods', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create period')
  }
})

export const deletePeriod = createAsyncThunk('app/deletePeriod', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`/school/periods/${id}`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete period')
  }
})

export const updateRoleConfig = createAsyncThunk('app/updateRoleConfig', async (data: any, { rejectWithValue }) => {
  try {
    const response = await axios.post('/school/role-config', data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update role configuration')
  }
})

export const resetStaffPassword = createAsyncThunk('app/resetStaffPassword', async (id: number, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/school/teachers/${id}/reset-password`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reset password')
  }
})

const initialState: AppState = {
  schoolData: null,
  timetable: [],
  events: [],
  attendance: [],
  loading: false,
  error: null,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchoolData.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSchoolData.fulfilled, (state, action: PayloadAction<SchoolData>) => {
        state.loading = false
        state.schoolData = action.payload
      })
      .addCase(fetchSchoolData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchTimetable.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.timetable = action.payload
      })
      .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.attendance = action.payload
      })
      .addCase(markAttendance.fulfilled, (state, action: PayloadAction<any[]>) => {
        // Merge updated records into current state
        const updatedRecords = action.payload
        const newAttendance = [...state.attendance]
        updatedRecords.forEach(record => {
          const idx = newAttendance.findIndex(a => a.user_id === record.user_id)
          if (idx !== -1) {
            newAttendance[idx] = record
          } else {
            newAttendance.push(record)
          }
        })
        state.attendance = newAttendance
      })
      .addCase(createGrade.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.grades.push(action.payload)
      })
      .addCase(createSection.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.sections.push(action.payload)
      })
      .addCase(createClass.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.classes.push(action.payload)
      })
      .addCase(updateClass.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) {
          const index = state.schoolData.classes.findIndex(c => c.id === action.payload.id)
          if (index !== -1) {
            state.schoolData.classes[index] = action.payload
          }
        }
      })
      .addCase(createSubject.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.subjects.push(action.payload)
      })
      .addCase(createClassroom.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.classrooms.push(action.payload)
      })
      .addCase(createTeacher.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.teachers.push(action.payload)
      })
      .addCase(deleteGrade.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) {
          state.schoolData.grades = state.schoolData.grades.filter(i => i.id !== action.payload)
          state.schoolData.classes = state.schoolData.classes.filter(i => i.grade_id !== action.payload)
        }
      })
      .addCase(deleteSection.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) {
          state.schoolData.sections = state.schoolData.sections.filter(i => i.id !== action.payload)
          state.schoolData.classes = state.schoolData.classes.filter(i => i.section_id !== action.payload)
        }
      })
      .addCase(deleteClass.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) state.schoolData.classes = state.schoolData.classes.filter(i => i.id !== action.payload)
      })
      .addCase(deleteSubject.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) state.schoolData.subjects = state.schoolData.subjects.filter(i => i.id !== action.payload)
      })
      .addCase(deleteClassroom.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) state.schoolData.classrooms = state.schoolData.classrooms.filter(i => i.id !== action.payload)
      })
      .addCase(deleteTeacher.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) state.schoolData.teachers = state.schoolData.teachers.filter(i => i.id !== action.payload)
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.events.push(action.payload)
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) state.schoolData.events = state.schoolData.events.filter(i => i.id !== action.payload)
      })
      .addCase(createPeriod.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) state.schoolData.periods.push(action.payload)
      })
      .addCase(deletePeriod.fulfilled, (state, action: PayloadAction<number>) => {
        if (state.schoolData) state.schoolData.periods = state.schoolData.periods.filter(i => i.id !== action.payload)
      })
      .addCase(updateRoleConfig.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.schoolData) {
          if (!state.schoolData.role_configs) state.schoolData.role_configs = []
          const index = state.schoolData.role_configs.findIndex((c: any) => c.role_name === action.payload.role_name)
          if (index !== -1) {
            state.schoolData.role_configs[index] = action.payload
          } else {
            state.schoolData.role_configs.push(action.payload)
          }
        }
      })
  },
})

export const { clearError } = appSlice.actions
export default appSlice.reducer
