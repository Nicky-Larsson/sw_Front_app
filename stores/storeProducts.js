import { defineStore } from 'pinia'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/js/firebase'

// import { useStoreAuth } from '@/stores/storeAuth'

let notesCollectionRef
let notesCollectionQuery

let getNotesSnapshot = null

export const useStoreProducts = defineStore('storeProducts', {
  state: () => {
    return { 
      products: [
        // {
        //   id: 'id1',
        //   content: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quidem ipsa commodi sint ut ullam culpa nulla molestiae sunt quia qui maxime.'
        // },
        // {
        //   id: 'id2',
        //   content: 'This is a shorter note! Woo!'
        // }
      ],
      productsLoaded: false
    }
  },
  actions: {

    async getProducts() {
      const querySnapshot = await getDocs(collection(db, 'volumes'))
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, ' => ', doc.data())
        let product = {
          id: doc.id,
          title: doc.data().title,
          cover: doc.data().cover,
          preview: doc.data().preview,
          description: doc.data().description,
          price: doc.data().price,
          name: doc.data().name,
          volume_num: doc.data().volume_num,
          thumbnail: doc.data().thumbnail
        }
        this.products.push(product)
        // console.log('product: ', product)
      })
    }
    
    /*init() {
      const storeAuth = useStoreAuth()

      notesCollectionRef = collection(db, 'users', storeAuth.user.id, 'notes')
      notesCollectionQuery = query(notesCollectionRef, orderBy('date', 'desc'))
      this.getNotes()
    }, 
    async getNotes() {
      this.notesLoaded = false

      if (getNotesSnapshot) getNotesSnapshot() // unsubscribe from any active listener

      getNotesSnapshot = onSnapshot(notesCollectionQuery, (querySnapshot) => {
        let notes = []
        querySnapshot.forEach((doc) => {
          let note = {
            id: doc.id,
            content: doc.data().content,
            date: doc.data().date
          }
          notes.push(note)
        })
        this.notes = notes
        this.notesLoaded = true
      }, error => {
        console.log('error.message: ', error.message)
      })
    },
    clearNotes() {
      this.notes = []
    },
    async addNote(newNoteContent) {
      let currentDate = new Date().getTime(),
          date = currentDate.toString()

      await addDoc(notesCollectionRef, {
        content: newNoteContent,
        date
      })
    },
    async deleteNote(idToDelete) {
      await deleteDoc(doc(notesCollectionRef, idToDelete))
    },
    async updateNote(id, content) {
      await updateDoc(doc(notesCollectionRef, id), {
        content
      })
    } */
  },
  getters: {
/*     getNoteContent: (state) => {
      return (id) => {
        return state.notes.filter(note => note.id === id )[0].content
      }
    },
    totalNotesCount: (state) => {
      return state.notes.length
    },
    totalCharactersCount: (state) => {
      let count = 0
      state.notes.forEach(note => {
        count += note.content.length
      })
      return count
    } */
  }
})