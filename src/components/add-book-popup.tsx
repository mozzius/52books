/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

import { api } from "@/utils/api";
import { Popup } from "./popup";
import { useDebounce } from "@/utils/hooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBookPopup = ({ isOpen, onClose }: Props) => {
  const close = () => {
    onClose();
    setTimeout(() => {
      setSelected(null);
      setTitle("");
    }, 500);
  };
  const [readAt, setReadAt] = useState(new Date().toISOString());
  const [selected, setSelected] = useState<null | string>(null);
  const [title, setTitle] = useState("");
  const query = useDebounce(title, 500);
  const search = api.books.search.useQuery(query, {
    enabled: query.length > 2,
  });
  const utils = api.useContext();
  const addBook = api.books.add.useMutation({
    onSuccess() {
      void utils.books.invalidate();
      close();
    },
  });

  let content = null;

  if (selected) {
    if (!search.data) return null;
    const book = search.data.find((book) => book.workId === selected);
    if (!book) return null;
    content = (
      <>
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl">
              {book.title}{" "}
              {book.firstPublishYear && `(${book.firstPublishYear})`}
            </h2>
            <p className="text-black/70">{book.author}</p>
          </div>
          <img src={book.images.medium} alt="" />
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p>When did you finish reading?</p>
            <input
              type="date"
              className="mt-1 w-40 border px-4 py-2"
              value={readAt}
              onChange={(evt) => setReadAt(evt.target.value)}
            />
          </div>
          <button
            className="float-right mt-4 border-none bg-slate-600 px-4 py-2 text-white"
            onClick={() =>
              addBook.mutate({
                workId: book.workId,
                title: book.title,
                author: book.author,
                firstPublishYear: book.firstPublishYear,
                image: book.images.medium,
                readAt: new Date(readAt),
              })
            }
          >
            Add book
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <input
          type="text"
          placeholder="Search for a book"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2"
        />
        <div className="mt-4 w-full">
          {search.data ? (
            search.data.map((book) => (
              <div
                key={book.workId}
                className="flex w-full cursor-pointer justify-between border-b p-4 hover:bg-slate-50"
                onClick={() => setSelected(book.workId)}
              >
                <div>
                  <h2>
                    {book.title}{" "}
                    {book.firstPublishYear && `(${book.firstPublishYear})`}
                  </h2>
                  {book.author && (
                    <p className="text-sm text-black/70">{book.author}</p>
                  )}
                </div>
                <img src={book.images.medium} alt="" />
              </div>
            ))
          ) : query.length > 2 ? (
            search.isLoading && <p className="my-10 text-center">Loading...</p>
          ) : (
            <p className="my-10 text-center">
              Enter the name of a book to search for it
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <Popup isOpen={isOpen} title="Add a book" onClose={close}>
      {content}
    </Popup>
  );
};
