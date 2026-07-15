import { apiSlice } from "./apiSlice";
import { unwrap, transformError, toQueryString } from "@/lib/apiHelpers";

const applyOptimisticVote = (comment, value) => {
    const prev = comment.myVote || 0;
    if (prev === value) {
        // clicking the same direction again retracts the vote
        comment.score -= value;
        if (value === 1) comment.upvotes -= 1;
        else comment.downvotes -= 1;
        comment.myVote = 0;
    } else {
        comment.score += value - prev;
        if (value === 1) {
            comment.upvotes += 1;
            if (prev === -1) comment.downvotes -= 1;
        } else {
            comment.downvotes += 1;
            if (prev === 1) comment.upvotes -= 1;
        }
        comment.myVote = value;
    }
};

export const commentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Generic params pass-through — {knowledge, sort} for a topic's
        // thread, or {flagged: true} for the admin moderation queue.
        getComments: builder.query({
            query: (params) => `/comments${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result, error, params) =>
                params?.flagged ? ["Comment"] : [{ type: "Comment", id: params.knowledge }],
        }),
        createComment: builder.mutation({
            query: (body) => ({ url: "/comments", method: "POST", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result, error, body) => [{ type: "Comment", id: body.knowledge }],
        }),
        updateComment: builder.mutation({
            query: ({ id, body }) => ({ url: `/comments/${id}`, method: "PATCH", body: { body } }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result, error, { knowledge }) => [{ type: "Comment", id: knowledge }],
        }),
        deleteComment: builder.mutation({
            query: ({ id }) => ({ url: `/comments/${id}`, method: "DELETE" }),
            invalidatesTags: (result, error, { knowledge }) => [{ type: "Comment", id: knowledge }, "Comment"],
        }),
        // Deliberately no `invalidatesTags` — that would trigger a full
        // refetch and visibly flash away the optimistic patch below.
        voteComment: builder.mutation({
            query: ({ id, value }) => ({ url: `/comments/${id}/vote`, method: "POST", body: { value } }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            async onQueryStarted({ id, value, knowledge, sort = "top" }, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    commentApi.util.updateQueryData("getComments", { knowledge, sort }, (draft) => {
                        const comment = draft?.find((c) => c._id === id);
                        if (comment) applyOptimisticVote(comment, value);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),
        flagComment: builder.mutation({
            query: ({ id, reason }) => ({ url: `/comments/${id}/flag`, method: "POST", body: { reason } }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["Comment"],
        }),
    }),
});

export const {
    useGetCommentsQuery,
    useCreateCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useVoteCommentMutation,
    useFlagCommentMutation,
} = commentApi;
